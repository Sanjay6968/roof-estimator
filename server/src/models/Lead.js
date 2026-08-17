import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Keeping string ID for legacy leads
  captured_at: { type: Date, default: Date.now },
  config_version: { type: Number, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  answers: { type: mongoose.Schema.Types.Mixed, required: true }, // Store flexible key-value answers
  estimate_low: { type: Number, required: true },
  estimate_high: { type: Number, required: true }
}, { timestamps: true });

export const Lead = mongoose.model('Lead', LeadSchema);
