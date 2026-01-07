import mongoose from 'mongoose';

const AllianceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    tag: { type: String, required: true, unique: true }, // [TAG]
    leader: { type: String, required: true }, // Wallet Address of leader
    members: [{ type: String }], // Array of Wallet Addresses
    description: { type: String, default: "" },
    color: { type: String, default: "#FFFFFF" }, // Alliance Theme Color
    avatar: { type: String, default: "default" }, // Identicon Seed
    stats: {
        totalPixels: { type: Number, default: 0 },
        rank: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});

export const Alliance = mongoose.model('Alliance', AllianceSchema);
