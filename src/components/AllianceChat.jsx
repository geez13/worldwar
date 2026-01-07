import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { API_URL } from '../config';

const ChatSystem = ({ socket, isOpen, allianceUpdateTrigger }) => {
    const { publicKey } = useWallet();
    const rootRef = useRef(null);
    const [alliance, setAlliance] = useState(null);
    const [activeTab, setActiveTab] = useState('GLOBAL'); // GLOBAL | ALLIANCE

    const [globalMessages, setGlobalMessages] = useState([]);
    const [allianceMessages, setAllianceMessages] = useState([]);

    const [input, setInput] = useState('');
    const [minimized, setMinimized] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial Setup
    useEffect(() => {
        if (!socket) return;
        socket.emit('join_global_room');
    }, [socket]);

    // Fetch user alliance on mount/wallet change OR trigger
    useEffect(() => {
        if (publicKey) {
            fetchUserStatus();
        } else {
            setAlliance(null);
            setActiveTab('GLOBAL');
        }
    }, [publicKey, allianceUpdateTrigger]);

    const fetchUserStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/user/${publicKey.toString()}`);
            const data = await res.json();
            if (data.user && data.user.allianceId && data.user.allianceId._id) {
                setAlliance(data.user.allianceId);
                // Join Alliance Room
                if (socket) {
                    socket.emit('join_alliance_room', {
                        allianceId: data.user.allianceId._id,
                        walletAddress: publicKey.toString()
                    });
                }
            } else {
                setAlliance(null);
            }
        } catch (e) {
            console.error("Chat: Error fetching alliance", e);
        }
    };

    // Listen for messages
    useEffect(() => {
        if (!socket) return;

        const handleAllianceMessage = (data) => {
            setAllianceMessages(prev => [...prev, data]);
        };

        const handleGlobalMessage = (data) => {
            setGlobalMessages(prev => [...prev, data]);
        };

        socket.on('alliance_message', handleAllianceMessage);
        socket.on('global_message', handleGlobalMessage);

        return () => {
            socket.off('alliance_message', handleAllianceMessage);
            socket.off('global_message', handleGlobalMessage);
        };
    }, [socket]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [globalMessages, allianceMessages, minimized, activeTab]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket || !publicKey) return;

        const sender = publicKey.toString().slice(0, 6);
        const tag = alliance ? alliance.tag : '';

        if (activeTab === 'ALLIANCE') {
            if (!alliance) return; // Should be disabled anyway
            socket.emit('alliance_chat_message', {
                allianceId: alliance._id,
                message: input,
                sender,
                tag
            });
        } else {
            // GLOBAL
            socket.emit('global_chat_message', {
                message: input,
                sender,
                tag
            });
        }
        setInput('');
    };

    return (
        <div
            ref={rootRef}
            style={{
                position: 'fixed', bottom: 20, left: 20, zIndex: 1000,
                width: minimized ? 'auto' : '320px',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderRadius: '8px',
                color: 'white',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                border: activeTab === 'ALLIANCE' && alliance ? `2px solid ${alliance.color}` : '2px solid #555',
                fontFamily: 'monospace',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
        >
            {/* Header / Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #444' }}>
                <div
                    onClick={() => setActiveTab('GLOBAL')}
                    style={{
                        flex: 1, padding: '10px', cursor: 'pointer', textAlign: 'center',
                        backgroundColor: activeTab === 'GLOBAL' ? '#333' : 'transparent',
                        fontWeight: activeTab === 'GLOBAL' ? 'bold' : 'normal',
                        color: activeTab === 'GLOBAL' ? 'white' : '#aaa'
                    }}
                >
                    GLOBAL
                </div>
                <div
                    onClick={() => {
                        if (alliance) setActiveTab('ALLIANCE');
                    }}
                    style={{
                        flex: 1, padding: '10px', cursor: alliance ? 'pointer' : 'not-allowed', textAlign: 'center',
                        backgroundColor: activeTab === 'ALLIANCE' ? (alliance?.color || '#333') : 'transparent',
                        fontWeight: activeTab === 'ALLIANCE' ? 'bold' : 'normal',
                        color: activeTab === 'ALLIANCE' ? 'black' : (alliance ? '#aaa' : '#444'),
                        opacity: alliance ? 1 : 0.5
                    }}
                >
                    {alliance ? `[${alliance.tag}]` : 'ALLIANCE'}
                </div>
                <div
                    onClick={() => setMinimized(!minimized)}
                    style={{ padding: '10px', cursor: 'pointer', background: '#222', color: '#fff' }}
                >
                    {minimized ? '▲' : '▼'}
                </div>
            </div>

            {/* Chat Area */}
            {!minimized && (
                <>
                    <div style={{
                        height: '250px', overflowY: 'auto', padding: '10px',
                        display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                        {(activeTab === 'GLOBAL' ? globalMessages : allianceMessages).length === 0 && (
                            <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                                {activeTab === 'GLOBAL' ? "Welcome to World Chat." : "Alliance Secure Channel."}
                            </div>
                        )}

                        {(activeTab === 'GLOBAL' ? globalMessages : allianceMessages).map((msg, i) => (
                            <div key={i} style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                <strong style={{ color: msg.sender === publicKey?.toString().slice(0, 6) ? '#00ff00' : (activeTab === 'GLOBAL' ? '#00ccff' : '#ffaa00') }}>
                                    {msg.tag && <span style={{ color: '#gold', marginRight: '4px' }}>[{msg.tag}]</span>}
                                    {msg.sender}:
                                </strong>
                                <span style={{ marginLeft: '5px', color: '#ddd' }}>{msg.message}</span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {(!publicKey) ? (
                        <div style={{ padding: '10px', borderTop: '1px solid #444', textAlign: 'center', fontSize: '12px', color: '#888' }}>
                            Connect Wallet to Chat
                        </div>
                    ) : (activeTab === 'ALLIANCE' && !alliance) ? (
                        <div style={{ padding: '10px', borderTop: '1px solid #444', textAlign: 'center', fontSize: '12px', color: '#aaa' }}>
                            Join an Alliance to chat here.
                        </div>
                    ) : (
                        <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #444' }}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Message ${activeTab === 'GLOBAL' ? 'World' : 'Alliance'}...`}
                                style={{
                                    flex: 1, padding: '10px', border: 'none', background: 'transparent',
                                    color: 'white', outline: 'none', fontSize: '13px'
                                }}
                            />
                            <button type="submit" style={{
                                padding: '0 15px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                            }}>SEND</button>
                        </form>
                    )}
                </>
            )}
        </div>
    );
};

export default ChatSystem;
