import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { Pixel } from './models/Pixel.js';
import { User } from './models/User.js';
import { Alliance } from './models/Alliance.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
// MongoDB Connection
// Use Environment Variable for production, fallback to local for dev
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/worldwar';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1); // Fail hard so Render restarts/fails
    });

// Auth Endpoint
app.post('/api/profile', async (req, res) => {
    try {
        const { walletAddress, signature, message, username, flag } = req.body;

        if (!walletAddress || !signature || !message || !username || !flag) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // Verify Signature
        const signatureUint8 = bs58.decode(signature);
        const messageUint8 = new TextEncoder().encode(message);
        const publicKeyUint8 = bs58.decode(walletAddress);

        const verified = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);

        if (!verified) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Update User
        const user = await User.findOneAndUpdate(
            { walletAddress },
            { username, flag },
            { upsert: true, new: true }
        );

        res.json({ success: true, user });
    } catch (e) {
        console.error('Profile update error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- User Routes ---
app.get('/api/user/:walletAddress', async (req, res) => {
    try {
        const user = await User.findOne({ walletAddress: req.params.walletAddress })
            .populate('allianceId');
        if (!user) return res.json({ user: null });
        res.json({ user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Alliance Routes ---

// Create Alliance
app.post('/api/alliance/create', async (req, res) => {
    try {
        const { walletAddress, signature, message, name, tag, color } = req.body;

        if (!walletAddress || !signature || !message || !name || !tag) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // 1. Verify Signature
        const signatureUint8 = bs58.decode(signature);
        const messageUint8 = new TextEncoder().encode(message);
        const publicKeyUint8 = bs58.decode(walletAddress);
        const verified = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);

        if (!verified) return res.status(401).json({ error: 'Invalid signature' });

        // 2. Check if user already in alliance
        const user = await User.findOne({ walletAddress });
        if (user && user.allianceId) {
            return res.status(400).json({ error: 'Already in an alliance' });
        }

        // 3. Check name/tag uniqueness
        const existing = await Alliance.findOne({ $or: [{ name }, { tag }] });
        if (existing) {
            return res.status(400).json({ error: 'Name or Tag taken' });
        }

        // 4. Create Alliance
        const newAlliance = new Alliance({
            name,
            tag,
            leader: walletAddress,
            members: [walletAddress],
            color: color || '#FFFFFF'
        });
        await newAlliance.save();

        // 5. Update User
        await User.findOneAndUpdate(
            { walletAddress },
            {
                allianceId: newAlliance._id,
                allianceRole: 'Leader'
            },
            { upsert: true }
        );

        res.json({ success: true, alliance: newAlliance });
    } catch (e) {
        console.error('Create alliance error:', e);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Join Alliance
app.post('/api/alliance/join', async (req, res) => {
    try {
        const { walletAddress, signature, message, allianceTag } = req.body;

        // Verify Signature matches walletAddress
        const signatureUint8 = bs58.decode(signature);
        const messageUint8 = new TextEncoder().encode(message);
        const publicKeyUint8 = bs58.decode(walletAddress);
        const verified = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
        if (!verified) return res.status(401).json({ error: 'Invalid signature' });

        // Find Alliance
        const alliance = await Alliance.findOne({ tag: allianceTag });
        if (!alliance) return res.status(404).json({ error: 'Alliance not found' });

        const user = await User.findOne({ walletAddress });
        if (user && user.allianceId) return res.status(400).json({ error: 'Already in an alliance' });

        // Add to members
        alliance.members.push(walletAddress);
        await alliance.save();

        // Update User
        await User.findOneAndUpdate(
            { walletAddress },
            { allianceId: alliance._id, allianceRole: 'Member' },
            { upsert: true }
        );

        res.json({ success: true, alliance });
    } catch (e) {
        console.error('Join alliance error:', e);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Get Alliance
app.get('/api/alliance/:id', async (req, res) => {
    try {
        const alliance = await Alliance.findById(req.params.id);
        if (!alliance) return res.status(404).json({ error: 'Not found' });
        res.json(alliance);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Kick Member
app.post('/api/alliance/kick', async (req, res) => {
    try {
        const { walletAddress, signature, message, targetWallet } = req.body;

        // Verify Signature (Leader)
        const signatureUint8 = bs58.decode(signature);
        const messageUint8 = new TextEncoder().encode(message);
        const publicKeyUint8 = bs58.decode(walletAddress);
        const verified = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
        if (!verified) return res.status(401).json({ error: 'Invalid signature' });

        // Get Leader and Alliance
        const leaderUser = await User.findOne({ walletAddress });
        if (!leaderUser || !leaderUser.allianceId) return res.status(400).json({ error: 'Not in alliance' });

        const alliance = await Alliance.findById(leaderUser.allianceId);
        if (alliance.leader !== walletAddress) return res.status(403).json({ error: 'Only leader can kick' });

        if (walletAddress === targetWallet) return res.status(400).json({ error: 'Cannot kick self' });

        // Remove from Alliance members
        alliance.members = alliance.members.filter(m => m !== targetWallet);
        await alliance.save();

        // Update Target User
        await User.findOneAndUpdate(
            { walletAddress: targetWallet },
            { allianceId: null, allianceRole: 'Member' }
        );

        res.json({ success: true });
    } catch (e) {
        console.error('Kick error:', e);
        res.status(500).json({ error: 'Server Error' });
    }
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// In-memory store for pixels (Cache)
// Key: "latIdx,lngIdx"
// Value: color string
// We load DB into this on start for speed.
const pixelMap = new Map();

// Load initial state
async function loadState() {
    try {
        const pixels = await Pixel.find({});

        pixels.forEach(p => {
            pixelMap.set(p.key, p.color);
        });
        console.log(`Loaded ${pixels.length} pixels from DB`);
    } catch (e) {
        console.error('Error loading state:', e);
    }
}
loadState();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send current state to new client
    socket.emit('init_state', Array.from(pixelMap.entries()));

    // Batch Paint for large updates
    socket.on('batch_paint', async ({ updates, walletAddress }) => {
        // updates: Array of { key, color }
        console.log(`Received batch_paint of size ${updates.length} from ${walletAddress || 'anonymous'}`);

        updates.forEach(({ key, color }) => {
            // 1. Update Memory
            pixelMap.set(key, color);
        });

        // 2. Broadcast batch update
        io.emit('batch_update', updates);

        // 3. Persist Async (in parallel/bulk if possible, or loop)
        // For MVP, simple loop is fine or bulkWrite
        // Doing loop for simplicity but catching errors individually
        for (const { key, color } of updates) {
            try {
                await Pixel.findOneAndUpdate(
                    { key },
                    { key, color, owner: walletAddress, timestamp: new Date() },
                    { upsert: true, new: true }
                );
            } catch (e) { console.error('Error saving batch pixel:', e); }
        }
    });

    socket.on('paint_pixel', async (data) => {
        // data: { key, color, walletAddress (optional for now) }
        const { key, color, walletAddress } = data;

        // 1. Update Memory
        pixelMap.set(key, color);

        // 2. Broadcast
        io.emit('pixel_update', { key, color });

        // 3. Persist Async
        try {
            await Pixel.findOneAndUpdate(
                { key },
                { key, color, owner: walletAddress, timestamp: new Date() },
                { upsert: true, new: true }
            );

            // Update User stats if wallet provided
            if (walletAddress) {
                await User.findOneAndUpdate(
                    { walletAddress },
                    { $inc: { totalPixels: 1 } },
                    { upsert: true }
                );
            }
        } catch (e) {
            console.error('Error saving pixel:', e);
        }
    });

    socket.on('erase_pixel', async (data) => {
        const { key, walletAddress } = data;

        // 1. Update Memory
        pixelMap.delete(key);

        // 2. Broadcast
        io.emit('pixel_erase', { key });

        // 3. Persist Async (Delete)
        try {
            await Pixel.deleteOne({ key });

            // Decrement user stats if wallet provided
            if (walletAddress) {
                await User.findOneAndUpdate(
                    { walletAddress },
                    { $inc: { totalPixels: -1 } }
                );
            }
        } catch (e) {
            console.error('Error erasing pixel:', e);
        }
    });

    // --- Alliance Chat Events ---
    socket.on('join_alliance_room', async (data) => {
        const { allianceId, walletAddress } = data;
        try {
            // OPTIONAL: Verify user is actually in this alliance
            const user = await User.findOne({ walletAddress });
            if (user && user.allianceId && user.allianceId.toString() === allianceId) {
                const roomName = `alliance_${allianceId}`;
                socket.join(roomName);
                console.log(`Socket ${socket.id} joined ${roomName}`);
            }
        } catch (e) {
            console.error('Error joining room:', e);
        }
    });

    socket.on('alliance_chat_message', (data) => {
        const { allianceId, message, sender, tag } = data; // sender = username or wallet
        const roomName = `alliance_${allianceId}`;
        io.to(roomName).emit('alliance_message', {
            message,
            sender,
            tag,
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
