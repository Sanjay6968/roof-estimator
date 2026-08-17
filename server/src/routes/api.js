import express from 'express';
import { Config } from '../models/Config.js';
import { Lead } from '../models/Lead.js';
import { calculateEstimate } from '../services/calculator.js';

const router = express.Router();

router.get('/config', async (req, res) => {
  try {
    const config = await Config.findOne().sort({ config_version: -1 });
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const activeQuestions = config.questions.filter(q => q.active).map(q => {
      return {
        key: q.key,
        label: q.label,
        type: q.type,
        unit: q.unit,
        required: q.required,
        min: q.min,
        max: q.max,
        options: q.options ? q.options.map(opt => ({ value: opt.value, label: opt.label })) : undefined
      };
    });

    res.json({
      config_version: config.config_version,
      business: config.business,
      questions: activeQuestions
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/estimate', async (req, res) => {
  try {
    const { name, phone, email, answers } = req.body;
    
    const config = await Config.findOne().sort({ config_version: -1 });
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const estimate = calculateEstimate(config, answers);

    const newLead = await Lead.create({
      id: `ld_${Date.now()}`,
      config_version: config.config_version,
      name,
      phone,
      email,
      answers,
      estimate_low: estimate.estimate_low,
      estimate_high: estimate.estimate_high
    });

    res.json({
      lead_id: newLead.id,
      estimate_low: estimate.estimate_low,
      estimate_high: estimate.estimate_high
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
