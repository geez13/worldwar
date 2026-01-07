import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const ProfileModal = ({ isOpen, onClose }) => {
    const { publicKey, signMessage } = useWallet();
    const [username, setUsername] = useState('');
    const [flag, setFlag] = useState('🏳️');
    const [tag, setTag] = useState(''); // New State for [TAG]
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    useEffect(() => {
        if (isOpen && publicKey) {
            fetchUserProfile();
        }
    }, [isOpen, publicKey]);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/api/user/${publicKey.toString()}`);
            const data = await res.json();
            if (data.user) {
                setUsername(data.user.username || '');
                setFlag(data.user.flag || '🏳️');
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

    if (!isOpen) return null;

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
                    flag
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

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '10px',
                width: '300px', display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
                <h2>Set Profile {tag && <span style={{ color: '#FFD700' }}>[{tag}]</span>}</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '8px', fontSize: '16px' }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>Flag:</span>
                    <input
                        type="text"
                        placeholder="Emoji"
                        value={flag}
                        onChange={(e) => setFlag(e.target.value)}
                        style={{ padding: '8px', fontSize: '16px', width: '50px' }}
                        maxLength={4}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#FF4500',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Signing...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
