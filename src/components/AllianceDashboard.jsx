import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

import { API_URL } from '../config';

const AllianceDashboard = ({ isOpen, onClose, onAllianceUpdate }) => {
    const { publicKey, signMessage } = useWallet();
    const [view, setView] = useState('CREATE'); // CREATE, JOIN, DETAILS
    const [alliance, setAlliance] = useState(null);
    const [loading, setLoading] = useState(false);

    // Forms
    const [createForm, setCreateForm] = useState({ name: '', tag: '', color: '#ff0000', avatar: Math.random().toString(36).substring(7) }); // Default random avatar
    const [joinTag, setJoinTag] = useState('');
    const [alliancesList, setAlliancesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const getContrastColor = (hexColor) => {
        if (!hexColor) return 'ffffff';
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '000000' : 'ffffff';
    };

    const getAvatarUrl = (seed, color) => {
        const userColorHex = color ? color.replace('#', '') : 'ff0000';
        const backgroundColorHex = getContrastColor(color);
        // Attempt to set foreground color using rowColor definition if supported, otherwise just set background
        return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=${backgroundColorHex}&rowColor=${userColorHex}`;
    };

    useEffect(() => {
        if (isOpen && publicKey) {
            fetchUserStatus();
        }
    }, [isOpen, publicKey]);

    useEffect(() => {
        if (view === 'JOIN') {
            fetchAlliances();
        }
    }, [view]);

    const fetchUserStatus = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/user/${publicKey.toString()}`);
            const data = await res.json();

            if (data.user && data.user.allianceId) {
                // If populated, allianceId is the object
                const allianceData = data.user.allianceId;
                // Depending on population depth, this might be full object or just ID
                if (allianceData._id) {
                    await fetchAllianceDetails(allianceData._id);
                } else {
                    // It might be just an ID string if population failed or schema weirdness
                    await fetchAllianceDetails(allianceData);
                }
            } else {
                setAlliance(null);
                setView('CREATE');
            }
        } catch (e) {
            console.error("Error fetching status:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllianceDetails = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/alliance/${id}`);
            const data = await res.json();
            setAlliance(data);
            setView('DETAILS');
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAlliances = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/alliances`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setAlliancesList(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!publicKey || !signMessage) return;
        setLoading(true);
        try {
            const message = `Create Alliance: ${createForm.name} [${createForm.tag}]`;
            const encodedMessage = new TextEncoder().encode(message);
            const signature = await signMessage(encodedMessage);

            const res = await fetch(`${API_URL}/api/alliance/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toString(),
                    signature: bs58.encode(signature),
                    message,
                    name: createForm.name,
                    message,
                    name: createForm.name,
                    tag: createForm.tag,
                    color: createForm.color,
                    avatar: createForm.avatar
                })
            });
            const data = await res.json();
            if (data.success) {
                setAlliance(data.alliance);
                setView('DETAILS');
                alert("Alliance Created!");
                if (onAllianceUpdate) onAllianceUpdate();
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error creating alliance");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (specificTag = null) => {
        const tagToJoin = specificTag || joinTag;
        if (!publicKey || !signMessage || !tagToJoin) return;
        setLoading(true);
        try {
            const message = `Join Alliance: ${tagToJoin}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signature = await signMessage(encodedMessage);

            const res = await fetch(`${API_URL}/api/alliance/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toString(),
                    signature: bs58.encode(signature),
                    message,
                    allianceTag: tagToJoin
                })
            });
            const data = await res.json();
            if (data.success) {
                setAlliance(data.alliance);
                setView('DETAILS');
                alert("Joined Alliance!");
                if (onAllianceUpdate) onAllianceUpdate();
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error joining alliance");
        } finally {
            setLoading(false);
        }
    };

    const handleKick = async (targetWallet) => {
        if (!publicKey || !signMessage) return;
        if (!confirm(`Kick ${targetWallet.slice(0, 8)}...?`)) return;

        setLoading(true);
        try {
            const message = `Kick Member: ${targetWallet}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signature = await signMessage(encodedMessage);

            const res = await fetch(`${API_URL}/api/alliance/kick`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toString(),
                    signature: bs58.encode(signature),
                    message,
                    targetWallet
                })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh list
                await fetchAllianceDetails(alliance._id);
                alert("Member Kicked");
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error kicking member");
        } finally {
            setLoading(false);
        }
    };

    const modalRef = React.useRef(null);

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
                    width: '400px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '16px',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: 'white', border: '2px solid #444', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontWeight: '800', fontSize: '24px', color: 'white' }}>🛡️ Alliance Hub</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
                </div>

                {!alliance ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={() => setView('CREATE')} style={{ flex: 1, padding: '10px', background: view === 'CREATE' ? '#555' : '#333', color: 'white', border: view === 'CREATE' ? '2px solid #888' : '2px solid transparent', borderRadius: '5px', cursor: 'pointer', fontWeight: view === 'CREATE' ? 'bold' : 'normal' }}>Create</button>
                            <button onClick={() => setView('JOIN')} style={{ flex: 1, padding: '10px', background: view === 'JOIN' ? '#555' : '#333', color: 'white', border: view === 'JOIN' ? '2px solid #888' : '2px solid transparent', borderRadius: '5px', cursor: 'pointer', fontWeight: view === 'JOIN' ? 'bold' : 'normal' }}>Join</button>
                        </div>

                        {view === 'CREATE' && (
                            <>
                                <input type="text" placeholder="Name (e.g. The Void)" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }} />
                                <input type="text" placeholder="Tag (e.g. VOID)" value={createForm.tag} onChange={e => setCreateForm({ ...createForm, tag: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }} />
                                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', marginBottom: '10px' }}>
                                    {/* Color Picker Section */}
                                    <div style={{
                                        flex: 1, display: 'flex', flexDirection: 'column', gap: '8px',
                                        padding: '12px', border: '1px solid #eee', borderRadius: '12px', alignItems: 'center'
                                    }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '12px',
                                            overflow: 'hidden', border: '2px solid #e0e0e0', cursor: 'pointer',
                                            position: 'relative'
                                        }}>
                                            <input
                                                type="color"
                                                value={createForm.color}
                                                onChange={e => setCreateForm({ ...createForm, color: e.target.value })}
                                                style={{
                                                    width: '150%', height: '150%', padding: 0, border: 'none',
                                                    position: 'absolute', top: '-25%', left: '-25%', cursor: 'pointer'
                                                }}
                                            />
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#aaa' }}>Alliance Color</span>
                                    </div>

                                    {/* Logo Selection Section */}
                                    <div style={{
                                        flex: 1, display: 'flex', flexDirection: 'column', gap: '8px',
                                        padding: '12px', border: '1px solid #eee', borderRadius: '12px', alignItems: 'center'
                                    }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '12px',
                                            backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '2px solid #e0e0e0'
                                        }}>
                                            <img
                                                src={getAvatarUrl(createForm.avatar, createForm.color)}
                                                alt="Avatar Preview"
                                                style={{ width: '64px', height: '64px', borderRadius: '8px' }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => setCreateForm({ ...createForm, avatar: Math.random().toString(36).substring(7) })}
                                            style={{
                                                padding: '6px 12px', fontSize: '12px', cursor: 'pointer',
                                                background: '#444', border: 'none', borderRadius: '20px', fontWeight: '600', color: 'white'
                                            }}
                                        >
                                            🎲 Randomize
                                        </button>
                                    </div>
                                </div>
                                <button onClick={handleCreate} disabled={loading} style={{ padding: '10px', background: '#FF4500', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    {loading ? 'Signing...' : 'Establish Alliance'}
                                </button>
                            </>
                        )}

                        {view === 'JOIN' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Search by Tag or Name..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }}
                                    />
                                </div>

                                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {alliancesList
                                        .filter(a =>
                                            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            a.tag.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map(a => (
                                            <div key={a._id} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '12px', border: '1px solid #444', borderRadius: '10px',
                                                backgroundColor: '#1a1a1a'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '40px', height: '40px', borderRadius: '8px',
                                                        backgroundColor: '#333', overflow: 'hidden', flexShrink: 0
                                                    }}>
                                                        <img
                                                            src={getAvatarUrl(a.avatar || 'default', a.color)}
                                                            alt="Logo"
                                                            style={{ width: '100%', height: '100%' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 'bold', color: 'white' }}>{a.name} <span style={{ color: '#888', fontWeight: 'normal' }}>[{a.tag}]</span></span>
                                                        <span style={{ fontSize: '12px', color: '#888' }}>{a.memberCount} Members • Leader: {a.leader.slice(0, 4)}..{a.leader.slice(-4)}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleJoin(a.tag)}
                                                    disabled={loading}
                                                    style={{
                                                        padding: '8px 16px', backgroundColor: '#333', color: 'white',
                                                        border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'
                                                    }}
                                                >
                                                    Join
                                                </button>
                                            </div>
                                        ))}
                                    {alliancesList.length === 0 && !loading && (
                                        <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No alliances found.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <img
                                src={getAvatarUrl(alliance.avatar || 'default', alliance.color)}
                                alt="Alliance Logo"
                                style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: '#222', border: '2px solid #444' }}
                            />
                            <div>
                                <h3 style={{ margin: 0, color: alliance.color, fontSize: '22px' }}>{alliance.name}</h3>
                                <span style={{ color: '#aaa', fontWeight: '600' }}>[{alliance.tag}]</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Team Members ({alliance.members.length})</h4>
                            <span style={{ fontSize: '14px', color: '#888', cursor: 'pointer' }}>See all</span>
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {alliance.members.map((m, idx) => {
                                const isLeader = m === alliance.leader;
                                const isMe = m === publicKey?.toString();
                                const displayName = m.slice(0, 8) + '...';

                                return (
                                    <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Avatar Circle */}
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '50%',
                                                backgroundColor: isLeader ? '#FFD700' : '#E0E0E0',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '20px', overflow: 'hidden'
                                            }}>
                                                <img
                                                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${m}`}
                                                    alt="avatar"
                                                    style={{ width: '100%', height: '100%' }}
                                                />
                                            </div>

                                            {/* Name & Subtext */}
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>
                                                    {displayName} {isLeader && '👑'}
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#888' }}>
                                                    {isLeader ? 'Leader' : 'Member'} • {isMe ? 'You' : 'Active'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Side: Stats or Action */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* Rank Icon Placeholder */}
                                            {idx < 3 && <span style={{ fontSize: '18px' }}>🏅</span>}

                                            {publicKey && alliance.leader === publicKey.toString() && m !== alliance.leader && (
                                                <button
                                                    onClick={() => handleKick(m)}
                                                    style={{
                                                        backgroundColor: '#ff4444', color: 'white', border: 'none',
                                                        borderRadius: '20px', cursor: 'pointer', fontSize: '12px',
                                                        padding: '4px 12px', fontWeight: '600'
                                                    }}
                                                >
                                                    Kick
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllianceDashboard;
