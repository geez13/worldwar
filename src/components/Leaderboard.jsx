import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minimized, setMinimized] = useState(false);

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

    const getAvatarUrl = (seed) => {
        return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed || 'default'}`;
    };

    const rootRef = React.useRef(null);

    if (minimized) {
        return (
            <div
                onClick={(e) => { e.stopPropagation(); setMinimized(false); }}
                onMouseDown={e => e.stopPropagation()}
                onDoubleClick={e => e.stopPropagation()}
                onWheel={e => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: '#FFD700',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    border: '2px solid #555',
                    fontSize: '16px'
                }}
            >
                🏆
            </div>
        );
    }

    // Get top 3 for podium
    const top3 = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
        <div
            ref={rootRef}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            onDoubleClick={e => e.stopPropagation()}
            onWheel={e => e.stopPropagation()}
            style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                width: '260px',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                borderRadius: '8px',
                padding: '16px',
                zIndex: 1000,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                border: '2px solid #555'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>🏆 Leaderboard</h3>
                <button
                    onClick={() => setMinimized(true)}
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}
                >
                    −
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', fontSize: '13px', color: '#888', padding: '20px 0' }}>Loading...</div>
            ) : leaders.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: '13px', color: '#888', padding: '20px 0' }}>No territory claimed yet.</div>
            ) : (
                <>
                    {/* Podium - Top 3 (Compact) */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px', marginBottom: '20px', minHeight: '110px' }}>
                        {/* 2nd Place - Left */}
                        {top3[1] && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{ position: 'relative', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '45px', height: '45px', borderRadius: '8px',
                                        border: '2px solid #c0c0c0', overflow: 'hidden', backgroundColor: '#222'
                                    }}>
                                        <img src={getAvatarUrl(top3[1].tag)} alt="" style={{ width: '100%', height: '100%' }} />
                                    </div>
                                    <div style={{
                                        position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        backgroundColor: '#c0c0c0', color: 'black',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '10px', border: '1px solid #222',
                                        zIndex: 10
                                    }}>2</div>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '600', marginTop: '4px', color: 'white' }}>[{top3[1].tag}]</span>
                                <span style={{ fontSize: '10px', color: '#aaa' }}>{top3[1].count.toLocaleString()}</span>
                            </div>
                        )}

                        {/* 1st Place - Center (Elevated) */}
                        {top3[0] && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, marginBottom: '10px' }}>
                                <div style={{ fontSize: '16px', marginBottom: '-4px', zIndex: 11 }}>👑</div>
                                <div style={{ position: 'relative', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '12px',
                                        border: '3px solid #ffd700', overflow: 'hidden', backgroundColor: '#222',
                                        boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
                                    }}>
                                        <img src={getAvatarUrl(top3[0].tag)} alt="" style={{ width: '100%', height: '100%' }} />
                                    </div>
                                    <div style={{
                                        position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        backgroundColor: '#ffd700', color: 'black',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '12px', border: '1px solid #222',
                                        zIndex: 10
                                    }}>1</div>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', marginTop: '6px', color: 'white' }}>{top3[0].name}</span>
                                <span style={{ fontSize: '11px', color: '#ffd700' }}>{top3[0].count.toLocaleString()}</span>
                            </div>
                        )}

                        {/* 3rd Place - Right */}
                        {top3[2] && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{ position: 'relative', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '45px', height: '45px', borderRadius: '8px',
                                        border: '2px solid #cd7f32', overflow: 'hidden', backgroundColor: '#222'
                                    }}>
                                        <img src={getAvatarUrl(top3[2].tag)} alt="" style={{ width: '100%', height: '100%' }} />
                                    </div>
                                    <div style={{
                                        position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        backgroundColor: '#cd7f32', color: 'black',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '10px', border: '1px solid #222',
                                        zIndex: 10
                                    }}>3</div>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '600', marginTop: '4px', color: 'white' }}>[{top3[2].tag}]</span>
                                <span style={{ fontSize: '10px', color: '#aaa' }}>{top3[2].count.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Table Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '6px 8px', fontSize: '11px', color: '#888',
                        borderBottom: '1px solid #444', marginBottom: '6px'
                    }}>
                        <span style={{ flex: '0 0 30px' }}>Rank</span>
                        <span style={{ flex: 1, textAlign: 'left' }}>Alliance</span>
                        <span style={{ flex: '0 0 60px', textAlign: 'right' }}>Pixels</span>
                    </div>

                    {/* Remaining List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                        {rest.map((alliance, index) => (
                            <div key={alliance._id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '8px 10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '6px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <span style={{ flex: '0 0 30px', fontWeight: '600', color: '#aaa', fontSize: '12px' }}>{index + 4}</span>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        backgroundColor: alliance.color, overflow: 'hidden',
                                        border: '1px solid #555'
                                    }}>
                                        <img src={getAvatarUrl(alliance.tag)} alt="" style={{ width: '100%', height: '100%' }} />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: '500', color: 'white' }}>[{alliance.tag}]</span>
                                </div>
                                <span style={{ flex: '0 0 60px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#ccc' }}>
                                    {alliance.count.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Leaderboard;
