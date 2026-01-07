import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true, unique: true },
    username: { type: String, default: null }, // Null implies "Anonymous" or "Recruit"
    flag: { type: String, default: null }, // ISO Country Code or custom ID
    droplets: { type: Number, default: 60 },
    maxDroplets: { type: Number, default: 60 },
    lastRefill: { type: Date, default: Date.now },
    totalPixels: { type: Number, default: 0 },
    allianceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alliance', default: null },
    allianceRole: { type: String, enum: ['Member', 'Leader', 'Officer'], default: 'Member' },
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
