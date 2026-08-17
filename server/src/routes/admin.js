import express from 'express';
import { Config } from '../models/Config.js';
import { Lead } from '../models/Lead.js';
import { requireOwnerAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireOwnerAuth);

router.get('/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ captured_at: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/config', async (req, res) => {
  try {
    const { questions, modifiers, business } = req.body;
    
    if (!business || !business.name || !business.currency) {
      return res.status(400).json({ error: 'Invalid business information' });
    }
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions must be a non-empty array' });
    }
    
    for (const q of questions) {
      if (!q.key || !q.label || !q.type) {
        return res.status(400).json({ error: 'Questions must have key, label, and type' });
      }
      if (q.type === 'select' && (!Array.isArray(q.options) || q.options.length === 0)) {
        return res.status(400).json({ error: 'Select questions must have an options array' });
      }
      if (q.options) {
        for (const opt of q.options) {
          if (!opt.value || !opt.label) {
            return res.status(400).json({ error: 'Options must have value and label' });
          }
          if (opt.rate_per_sqft !== undefined && typeof opt.rate_per_sqft !== 'number') {
            return res.status(400).json({ error: 'Rates must be numeric' });
          }
          if (opt.multiplier !== undefined && typeof opt.multiplier !== 'number') {
            return res.status(400).json({ error: 'Multipliers must be numeric' });
          }
          if (opt.tear_off_per_sqft !== undefined && typeof opt.tear_off_per_sqft !== 'number') {
            return res.status(400).json({ error: 'Tear off rates must be numeric' });
          }
        }
      }
    }

    if (!modifiers || typeof modifiers.waste_factor !== 'number' || typeof modifiers.permit_flat_fee !== 'number') {
      return res.status(400).json({ error: 'Invalid or missing numeric modifiers' });
    }

    const currentConfig = await Config.findOne().sort({ config_version: -1 });
    const nextVersion = currentConfig ? currentConfig.config_version + 1 : 1;
    
    const newConfigData = {
      ...req.body,
      config_version: nextVersion
    };
    
    delete newConfigData._id;
    delete newConfigData.createdAt;
    delete newConfigData.updatedAt;

    const newConfig = await Config.create(newConfigData);
    res.json(newConfig);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
