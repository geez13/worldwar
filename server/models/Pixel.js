import mongoose from 'mongoose';

const PixelSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // "latIdx,lngIdx"
    color: { type: String, required: true },
    owner: { type: String, default: null }, // Wallet Address
    allianceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alliance', default: null }, // Owning Alliance
    timestamp: { type: Date, default: Date.now }
});

// Index for spatial queries if needed later, but 'key' is primary access pattern
PixelSchema.index({ key: 1 });

export const Pixel = mongoose.model('Pixel', PixelSchema);
