import React from 'react';

const InfoModal = ({ isOpen, onClose }) => {
    const modalRef = React.useRef(null);
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100000
        }}
        >
            <div
                ref={modalRef}
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    color: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    maxWidth: '450px',
                    width: '90%',
                    border: '2px solid #444',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>

                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'white' }}>🌍 WORLD WAR</h1>
                    <div style={{ width: '60px', height: '4px', backgroundColor: '#333', margin: '15px auto 5px', borderRadius: '2px' }}></div>
                </div>

                {/* Content */}
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', color: '#ccc', fontSize: '15px', lineHeight: '1.5' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>🪙</span>
                        <div>
                            <strong style={{ color: 'white' }}>Requirement</strong>
                            <div style={{ fontSize: '14px', marginTop: '2px' }}>You must hold at least <span style={{ color: '#aaa', fontWeight: '600' }}>1 $WDOM Token</span> to play.</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>🛡️</span>
                        <div>
                            <strong style={{ color: 'white' }}>Join an Alliance</strong>
                            <div style={{ fontSize: '14px', marginTop: '2px' }}>Solo players are weak. Join an Alliance to gain a color and protect your territory.</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>🏆</span>
                        <div>
                            <strong style={{ color: 'white' }}>Win Rewards</strong>
                            <div style={{ fontSize: '14px', marginTop: '2px' }}>Every week, the Alliance dominating the leaderboard will receive Token Rewards.</div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: '#FF4500', // Primary Action Color
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        fontSize: '16px',
                        fontWeight: '700',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginTop: '10px',
                        width: '100%',
                        boxShadow: '0 4px 12px rgba(255, 69, 0, 0.3)',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#ff571a'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#FF4500'}
                >
                    ENTER BATTLEFIELD ⚔️
                </button>
            </div>
        </div>
    );
};

export default InfoModal;
