import React from 'react';

const InfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100000 // Highest z-index
        }}>
            <div style={{
                backgroundColor: '#1a1a1a',
                color: 'white',
                padding: '30px',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '90%',
                border: '2px solid #FFD700',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                textAlign: 'center',
                fontFamily: 'sans-serif'
            }}>
                <h1 style={{ color: '#FFD700', marginTop: 0, marginBottom: '20px' }}>🌍 WORLD WAR 🌍</h1>

                <div style={{ textAlign: 'left', marginBottom: '30px', lineHeight: '1.6' }}>
                    <p><strong>1. Requirement:</strong><br />You must hold at least <span style={{ color: '#00ff00' }}>1 $WDOM Token</span> in your wallet to play.</p>

                    <p><strong>2. Join an Alliance:</strong><br />Solo players are weak. Join an Alliance to gain a color and protect your territory. Alliances share pixels and glory.</p>

                    <p><strong>3. Win Rewards:</strong><br />Every week, the Alliance dominating the leaderboard will receive <span style={{ color: '#FFD700' }}>Token Rewards</span>.</p>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: '#FFD700',
                        color: 'black',
                        border: 'none',
                        padding: '12px 30px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        boxShadow: '0 4px 0 #b8860b'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    ENTER BATTLEFIELD ⚔️
                </button>
            </div>
        </div>
    );
};

export default InfoModal;
