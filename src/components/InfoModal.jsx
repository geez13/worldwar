import React, { useState } from 'react';
import { BUY_PXN_URL } from '../config';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const SLIDES = [
    {
        icon: '🪙',
        title: 'Buy $PXN',
        description: 'You must hold at least 1 $PXN (PIXELNATION) Token to play.',
        buttonText: 'BUY $PXN',
        buttonAction: 'buy'
    },
    {
        icon: '🛡️',
        title: 'Join or Create Alliance',
        description: 'Solo players are weak. Join an Alliance to gain a color and protect your territory.',
        subtext: 'To CREATE an Alliance, you must hold 1% or more of the total $PXN supply.',
        buttonText: 'NEXT',
        buttonAction: 'next'
    },
    {
        icon: '🏆',
        title: 'Win Rewards',
        description: 'Every week, the Alliance dominating the leaderboard will receive Token Rewards.',
        buttonText: 'ENTER BATTLEFIELD ⚔️',
        buttonAction: 'close'
    }
];

const InfoModal = ({ isOpen, onClose, hasToken = false, isCheckingToken = false, isConnected = false }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const modalRef = React.useRef(null);

    if (!isOpen) return null;

    const slide = SLIDES[currentSlide];

    // Determine if user can enter the game
    const canEnterGame = hasToken;

    const handleButtonClick = () => {
        if (slide.buttonAction === 'buy') {
            window.open(BUY_PXN_URL, '_blank');
            setCurrentSlide(prev => prev + 1);
        } else if (slide.buttonAction === 'next') {
            setCurrentSlide(prev => prev + 1);
        } else if (slide.buttonAction === 'close') {
            if (canEnterGame) {
                setCurrentSlide(0);
                onClose();
            } else {
                // Can't close - show first slide to buy token
                setCurrentSlide(0);
            }
        }
    };

    const handleDotClick = (index) => {
        setCurrentSlide(index);
    };

    const goToPrev = () => {
        setCurrentSlide(prev => (prev > 0 ? prev - 1 : SLIDES.length - 1));
    };

    const goToNext = () => {
        setCurrentSlide(prev => (prev < SLIDES.length - 1 ? prev + 1 : 0));
    };

    const arrowButtonStyle = {
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s'
    };

    // Token gating banner
    const renderTokenStatus = () => {
        if (isCheckingToken) {
            return (
                <div style={{
                    backgroundColor: 'rgba(100, 100, 255, 0.2)',
                    border: '1px solid #6666ff',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center',
                    marginBottom: '15px'
                }}>
                    <span style={{ color: '#aaaaff' }}>⏳ Checking token balance...</span>
                </div>
            );
        }

        if (!isConnected) {
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 165, 0, 0.2)',
                    border: '1px solid #ffa500',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    marginBottom: '15px'
                }}>
                    <div style={{ color: '#ffcc00', marginBottom: '10px', fontSize: '14px' }}>
                        🔗 Connect your wallet to play
                    </div>
                    <WalletMultiButton style={{
                        backgroundColor: '#FF4500',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        height: '36px',
                        padding: '0 16px',
                        cursor: 'pointer'
                    }} />
                </div>
            );
        }

        if (!hasToken) {
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 69, 0, 0.2)',
                    border: '1px solid #FF4500',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center',
                    marginBottom: '15px'
                }}>
                    <span style={{ color: '#ff6b4a' }}>🚫 You need $PXN tokens to play!</span>
                </div>
            );
        }

        return (
            <div style={{
                backgroundColor: 'rgba(0, 200, 83, 0.2)',
                border: '1px solid #00c853',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
                marginBottom: '15px'
            }}>
                <span style={{ color: '#69f0ae' }}>✅ Token verified! You can play.</span>
            </div>
        );
    };

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
        }}>
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
                    gap: '15px',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    position: 'relative'
                }}>

                {/* Close Button - only show if user has token */}
                {canEnterGame && (
                    <button
                        onClick={() => { setCurrentSlide(0); onClose(); }}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#FF4500',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#ff571a'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#FF4500'}
                    >
                        ✕
                    </button>
                )}

                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <img src="/Textlogo.svg" alt="PIXELNATION" style={{ maxWidth: '100%', height: 'auto', maxHeight: '60px' }} />
                    <div style={{ width: '60px', height: '4px', backgroundColor: '#333', margin: '15px auto 5px', borderRadius: '2px' }}></div>
                </div>

                {/* Token Status Banner */}
                {renderTokenStatus()}

                {/* Slide Content with Arrows */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Left Arrow */}
                    <button
                        onClick={goToPrev}
                        style={arrowButtonStyle}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        ‹
                    </button>

                    {/* Slide Content */}
                    <div style={{
                        flex: 1,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '12px',
                        color: '#ccc',
                        fontSize: '15px',
                        lineHeight: '1.5',
                        height: '160px'
                    }}>
                        <span style={{ fontSize: '40px' }}>{slide.icon}</span>
                        <strong style={{ color: 'white', fontSize: '18px' }}>{slide.title}</strong>
                        <div style={{ fontSize: '14px' }}>{slide.description}</div>
                        <div style={{
                            fontSize: '12px',
                            color: '#888',
                            padding: '8px',
                            backgroundColor: slide.subtext ? 'rgba(255,255,255,0.05)' : 'transparent',
                            borderRadius: '6px',
                            visibility: slide.subtext ? 'visible' : 'hidden',
                            minHeight: '36px'
                        }}>
                            {slide.subtext ? `⚠️ ${slide.subtext}` : '\u00A0'}
                        </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={goToNext}
                        style={arrowButtonStyle}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        ›
                    </button>
                </div>

                {/* Carousel Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {SLIDES.map((_, index) => (
                        <div
                            key={index}
                            onClick={() => handleDotClick(index)}
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: currentSlide === index ? '#FF4500' : '#555',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        />
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleButtonClick}
                    disabled={slide.buttonAction === 'close' && !canEnterGame}
                    style={{
                        backgroundColor: (slide.buttonAction === 'close' && !canEnterGame) ? '#555' : '#FF4500',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        fontSize: '16px',
                        fontWeight: '700',
                        borderRadius: '8px',
                        cursor: (slide.buttonAction === 'close' && !canEnterGame) ? 'not-allowed' : 'pointer',
                        width: '100%',
                        boxShadow: '0 4px 12px rgba(255, 69, 0, 0.3)',
                        transition: 'background 0.2s',
                        opacity: (slide.buttonAction === 'close' && !canEnterGame) ? 0.6 : 1
                    }}
                    onMouseOver={e => {
                        if (!(slide.buttonAction === 'close' && !canEnterGame)) {
                            e.currentTarget.style.backgroundColor = '#ff571a';
                        }
                    }}
                    onMouseOut={e => {
                        if (!(slide.buttonAction === 'close' && !canEnterGame)) {
                            e.currentTarget.style.backgroundColor = '#FF4500';
                        }
                    }}
                >
                    {slide.buttonAction === 'close' && !canEnterGame
                        ? '🔒 TOKEN REQUIRED'
                        : slide.buttonText}
                </button>
            </div>
        </div>
    );
};

export default InfoModal;

