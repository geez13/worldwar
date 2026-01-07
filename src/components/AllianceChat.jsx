import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const AllianceChat = ({ socket, isOpen }) => {
    const { publicKey } = useWallet();
    const [alliance, setAlliance] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [minimized, setMinimized] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch user alliance on mount/wallet change
    useEffect(() => {
        if (publicKey) {
            fetchUserStatus();
        } else {
            setAlliance(null);
        }
    }, [publicKey]);

    const fetchUserStatus = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/user/${publicKey.toString()}`);
            const data = await res.json();
            if (data.user && data.user.allianceId && data.user.allianceId._id) {
                setAlliance(data.user.allianceId);
                // Join Room
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

        const handleMessage = (data) => {
            setMessages(prev => [...prev, data]);
        };

        socket.on('alliance_message', handleMessage);

        return () => {
            socket.off('alliance_message', handleMessage);
        };
    }, [socket]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, minimized]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket || !alliance || !publicKey) return;

        socket.emit('alliance_chat_message', {
            allianceId: alliance._id,
            message: input,
            sender: publicKey.toString().slice(0, 6), // Use username if available later
            tag: alliance.tag
        });
        setInput('');
    };

    // Render even if no alliance, so user knows it's there
    if (!alliance) {
        return (
            <div style={{
                position: 'fixed', bottom: 20, left: 20, zIndex: 1000,
                padding: '10px', backgroundColor: 'rgba(0,0,0,0.8)',
                borderRadius: '8px', color: '#ccc', border: '1px solid #444',
                fontSize: '12px', backdropFilter: 'blur(5px)'
            }}>
                {publicKey ? "🛡️ Join an Alliance to open Chat" : "🔌 Connect Wallet to Chat"}
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed', bottom: 20, left: 20, zIndex: 1000,
            width: minimized ? 'auto' : '300px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '8px',
            color: 'white',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            border: `2px solid ${alliance.color}`,
            fontFamily: 'monospace',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
            {/* Header */}
            <div
                onClick={() => setMinimized(!minimized)}
                style={{
                    padding: '10px', backgroundColor: alliance.color, cursor: 'pointer',
                    fontWeight: 'bold', display: 'flex', justifyContent: 'space-between',
                    whiteSpace: 'nowrap'
                }}>
                <span style={{ color: 'black', textShadow: 'none' }}>
                    [{alliance.tag}] {minimized ? '' : 'Secure Channel'}
                </span>
                <span style={{ marginLeft: '10px', color: 'black' }}>{minimized ? 'Chat ▲' : '▼'}</span>
            </div>

            {/* Chat Area */}
            {!minimized && (
                <>
                    <div style={{
                        height: '200px', overflowY: 'auto', padding: '10px',
                        display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                        {messages.length === 0 && <div style={{ color: '#666', fontStyle: 'italic' }}>Channel secured. No messages.</div>}

                        {messages.map((msg, i) => (
                            <div key={i} style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                <strong style={{ color: msg.sender === publicKey?.toString().slice(0, 6) ? '#00ff00' : '#ffaa00' }}>
                                    [{msg.tag}] {msg.sender}:
                                </strong>
                                <span style={{ marginLeft: '5px', color: '#ddd' }}>{msg.message}</span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #444' }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Encrypted Message..."
                            style={{
                                flex: 1, padding: '10px', border: 'none', background: 'transparent',
                                color: 'white', outline: 'none', fontSize: '13px'
                            }}
                        />
                        <button type="submit" style={{
                            padding: '0 15px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                        }}>SEND</button>
                    </form>
                </>
            )}
        </div>
    );
};

export default AllianceChat;
