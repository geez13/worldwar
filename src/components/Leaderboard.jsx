import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minimized, setMinimized] = useState(false);

    const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`${API_URL}/api/leaderboard`);
            const data = await res.json();
            setLeaders(data);
            setLoading(false);
        } catch (e) {
            console.error("Leaderboard fetch error", e);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    if (minimized) {
        return (
            <div
                onClick={() => setMinimized(false)}
                style={{
                    position: 'absolute',
                    top: '80px',
                    right: '20px',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'gold',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    border: '1px solid gold'
                }}
            >
                🏆
            </div>
        );
    }

    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            width: '250px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '12px',
            padding: '15px',
            zIndex: 1000,
            fontFamily: 'sans-serif',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FFD700' }}>🏆 Domination</h3>
                <button
                    onClick={() => setMinimized(true)}
                    style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '14px' }}
                >
                    _
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#aaa' }}>Loading...</div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {leaders.length === 0 && <li style={{ fontSize: '12px', color: '#888' }}>No territory claimed yet.</li>}
                    {leaders.map((alliance, index) => (
                        <li key={alliance._id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: index < leaders.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 'bold', minWidth: '20px', color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#fff' }}>
                                    #{index + 1}
                                </span>
                                <div style={{ width: '12px', height: '12px', backgroundColor: alliance.color, borderRadius: '50%', border: '1px solid white' }}></div>
                                <span style={{ fontSize: '14px' }}>[{alliance.tag}]</span>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{alliance.count.toLocaleString()} px</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Leaderboard;
