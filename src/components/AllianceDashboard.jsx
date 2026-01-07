import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

const AllianceDashboard = ({ isOpen, onClose }) => {
    const { publicKey, signMessage } = useWallet();
    const [view, setView] = useState('CREATE'); // CREATE, JOIN, DETAILS
    const [alliance, setAlliance] = useState(null);
    const [loading, setLoading] = useState(false);

    // Forms
    const [createForm, setCreateForm] = useState({ name: '', tag: '', color: '#ff0000' });
    const [joinTag, setJoinTag] = useState('');

    const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    useEffect(() => {
        if (isOpen && publicKey) {
            fetchUserStatus();
        }
    }, [isOpen, publicKey]);

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
                    tag: createForm.tag,
                    color: createForm.color
                })
            });
            const data = await res.json();
            if (data.success) {
                setAlliance(data.alliance);
                setView('DETAILS');
                alert("Alliance Created!");
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

    const handleJoin = async () => {
        if (!publicKey || !signMessage) return;
        setLoading(true);
        try {
            const message = `Join Alliance: ${joinTag}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signature = await signMessage(encodedMessage);

            const res = await fetch(`${API_URL}/api/alliance/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toString(),
                    signature: bs58.encode(signature),
                    message,
                    allianceTag: joinTag
                })
            });
            const data = await res.json();
            if (data.success) {
                setAlliance(data.alliance);
                setView('DETAILS');
                alert("Joined Alliance!");
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

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '24px', borderRadius: '12px',
                width: '400px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>🛡️ Alliance Command</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖️</button>
                </div>

                {!alliance ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={() => setView('CREATE')} style={{ flex: 1, padding: '10px', background: view === 'CREATE' ? '#333' : '#ddd', color: view === 'CREATE' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Create</button>
                            <button onClick={() => setView('JOIN')} style={{ flex: 1, padding: '10px', background: view === 'JOIN' ? '#333' : '#ddd', color: view === 'JOIN' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Join</button>
                        </div>

                        {view === 'CREATE' && (
                            <>
                                <input type="text" placeholder="Name (e.g. The Void)" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} style={{ padding: '8px' }} />
                                <input type="text" placeholder="Tag (e.g. VOID)" value={createForm.tag} onChange={e => setCreateForm({ ...createForm, tag: e.target.value })} style={{ padding: '8px' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label>Color:</label>
                                    <input type="color" value={createForm.color} onChange={e => setCreateForm({ ...createForm, color: e.target.value })} />
                                </div>
                                <button onClick={handleCreate} disabled={loading} style={{ padding: '10px', background: '#FF4500', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    {loading ? 'Signing...' : 'Establish Alliance'}
                                </button>
                            </>
                        )}

                        {view === 'JOIN' && (
                            <>
                                <input type="text" placeholder="Enter Alliance Tag" value={joinTag} onChange={e => setJoinTag(e.target.value)} style={{ padding: '8px' }} />
                                <button onClick={handleJoin} disabled={loading} style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    {loading ? 'Signing...' : 'Join Alliance'}
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div>
                        <h3 style={{ color: alliance.color }}>[{alliance.tag}] {alliance.name}</h3>
                        <p><strong>Leader:</strong> {alliance.leader.slice(0, 6)}...</p>
                        <p><strong>Members:</strong> {alliance.members.length}</p>
                        <ul style={{ maxHeight: '150px', overflowY: 'auto', paddingLeft: '0', listStyle: 'none' }}>
                            {alliance.members.map(m => (
                                <li key={m} style={{ padding: '5px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{m.slice(0, 8)}... {m === alliance.leader && '👑'}</span>
                                    {publicKey && alliance.leader === publicKey.toString() && m !== alliance.leader && (
                                        <button
                                            onClick={() => handleKick(m)}
                                            style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', padding: '2px 5px' }}
                                        >
                                            Kick
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllianceDashboard;
