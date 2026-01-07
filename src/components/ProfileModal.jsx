import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const ProfileModal = ({ isOpen, onClose }) => {
    const { publicKey, signMessage } = useWallet();
    const [username, setUsername] = useState('');
    const [avatarSeed, setAvatarSeed] = useState('');
    const [tag, setTag] = useState('');
    const [loading, setLoading] = useState(false);
    const modalRef = React.useRef(null);
    const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    // Generate avatar URL using DiceBear pixel-art
    const getAvatarUrl = (seed) => {
        return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed || 'default'}`;
    };

    useEffect(() => {
        if (isOpen && publicKey) {
            fetchUserProfile();
        }
    }, [isOpen, publicKey]);

    // Initialize avatarSeed with wallet address if not set
    useEffect(() => {
        if (publicKey && !avatarSeed) {
            setAvatarSeed(publicKey.toString().slice(0, 8));
        }
    }, [publicKey]);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/api/user/${publicKey.toString()}`);
            const data = await res.json();
            if (data.user) {
                setUsername(data.user.username || '');
                setAvatarSeed(data.user.flag || publicKey.toString().slice(0, 8)); // Use flag field for avatar seed
                if (data.user.allianceId && data.user.allianceId.tag) {
                    setTag(data.user.allianceId.tag);
                } else {
                    setTag('');
                }
            }
        } catch (e) {
            console.error("Error fetching profile:", e);
        }
    };

    const randomizeAvatar = () => {
        setAvatarSeed(Math.random().toString(36).substring(2, 10));
    };

    const handleSave = async () => {
        if (!publicKey || !signMessage) {
            alert('Please connect your wallet first!');
            return;
        }
        try {
            setLoading(true);
            const messageContent = `Update Profile: ${username} - ${Date.now()}`;
            const message = new TextEncoder().encode(messageContent);

            const signature = await signMessage(message);
            const signatureStr = bs58.encode(signature);

            const response = await fetch(`${API_URL}/api/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toString(),
                    signature: signatureStr,
                    message: messageContent,
                    username,
                    flag: avatarSeed // Store avatarSeed in the flag field
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Profile Updated!');
                onClose();
            } else {
                alert('Update Failed: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div
                ref={modalRef}
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.95)', padding: '24px', borderRadius: '12px',
                    width: '340px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '16px',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: 'white', border: '2px solid #444', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontWeight: '800', fontSize: '22px', color: 'white' }}>
                        👤 Profile {tag && <span style={{ color: '#FFD700', fontSize: '16px' }}>[{tag}]</span>}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
                </div>

                {/* Avatar Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        backgroundColor: '#222', border: '3px solid #555', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <img
                            src={getAvatarUrl(avatarSeed)}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                    <button
                        onClick={randomizeAvatar}
                        style={{
                            padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
                            background: '#444', border: 'none', borderRadius: '20px',
                            fontWeight: '600', color: 'white'
                        }}
                    >
                        🎲 Randomize Avatar
                    </button>
                </div>

                {/* Username Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: '#aaa', fontWeight: '500' }}>Username</label>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            padding: '12px', fontSize: '15px', borderRadius: '8px',
                            border: '1px solid #444', backgroundColor: '#222', color: 'white'
                        }}
                    />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px', backgroundColor: '#333', color: 'white',
                            border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#FF4500',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Signing...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
