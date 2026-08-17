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
