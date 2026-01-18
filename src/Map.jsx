import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import ProfileModal from './components/ProfileModal';
import AllianceDashboard from './components/AllianceDashboard';
import AllianceChat from './components/AllianceChat';
import Leaderboard from './components/Leaderboard';
import InfoModal from './components/InfoModal';
import TokenStats from './components/TokenStats';
import { checkTokenBalance } from './services/tokenService';
import { API_URL as SOCKET_URL } from './config';

// 0.05 degrees is roughly 5.5km (Strategy Game Scale)
const GRID_STEP = 0.05;
// SOCKET_URL is imported from config at top level


// Zoom Indicator Component
function ZoomIndicator() {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useMapEvent('zoom', () => {
        setZoom(map.getZoom());
    });

    return (
        <div style={{
            position: 'absolute', bottom: 20, left: 350, zIndex: 10000,
            display: 'flex', alignItems: 'center', gap: '8px'
        }}>
            {/* Zoom Indicator */}
            <div style={{
                padding: '5px 10px', backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white', borderRadius: '4px', fontSize: '14px',
                pointerEvents: 'none', userSelect: 'none',
                fontFamily: 'monospace',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                Zoom: {zoom}x
            </div>

            {/* Social Media Buttons */}
            <a
                href="https://x.com/PIXELNATION_SOL"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    width: '32px', height: '32px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
                title="Follow us on X"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </a>
            <a
                href="https://t.me/pixelnation_sol"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    width: '32px', height: '32px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
                title="Join us on Telegram"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
            </a>

            {/* Documentation Shortcut */}
            <a
                href="/docs"
                style={{
                    width: '32px', height: '32px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    textDecoration: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
                title="Read Documentation"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm-4-6H8v-2h6v2zm3-4H8V7h9v2zm-3 8H8v-2h6v2z" />
                </svg>
            </a>
        </div>
    );
}

function GridOverlay({ selectedColor, socket }) {
    const map = useMap();
    const canvasRef = useRef(null);
    const [pixels, setPixels] = useState(new Map());
    const { publicKey } = useWallet();

    useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => {
            console.log('Connected to server via Socket.io');
        });

        socket.on('init_state', (data) => {
            // data is Array of [key, color]
            console.log('Received init_state', data.length);
            setPixels(new Map(data));
        });

        socket.on('batch_update', (updates) => {
            // updates: Array of { key, color }
            setPixels(prev => {
                const next = new Map(prev);
                updates.forEach(({ key, color }) => next.set(key, color));
                return next;
            });
        });

        socket.on('pixel_update', ({ key, color }) => {
            setPixels(prev => {
                const next = new Map(prev);
                next.set(key, color);
                return next;
            });
        });

        socket.on('pixel_erase', ({ key }) => {
            setPixels(prev => {
                const next = new Map(prev);
                next.delete(key);
                return next;
            });
        });

        socket.on('paint_error', ({ message }) => {
            console.log('Paint error:', message);
            // Could show a toast notification here instead of alert
        });

        return () => {
            socket.off('connect');
            socket.off('init_state');
            socket.off('pixel_update');
            socket.off('pixel_erase');
            socket.off('paint_error');
        };
    }, [socket]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const draw = () => {
            // Show pixels at all allowed zoom levels (MinZoom is 3)
            if (map.getZoom() < 3) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            const size = map.getSize();
            const dpr = window.devicePixelRatio || 1;

            if (canvas.width !== size.x * dpr || canvas.height !== size.y * dpr) {
                canvas.width = size.x * dpr;
                canvas.height = size.y * dpr;
                canvas.style.width = `${size.x}px`;
                canvas.style.height = `${size.y}px`;
                ctx.scale(dpr, dpr);
            }

            ctx.clearRect(0, 0, size.x, size.y);

            // Draw Pixels
            pixels.forEach((color, key) => {
                const [latIdx, lngIdx] = key.split(',').map(Number);
                const lat = latIdx * GRID_STEP;
                const lng = lngIdx * GRID_STEP;

                const north = lat + GRID_STEP;
                // South is lat
                const east = lng + GRID_STEP;
                const west = lng;

                const p1 = map.latLngToContainerPoint([north, west]); // Top-Left
                const p2 = map.latLngToContainerPoint([lat, east]);   // Bottom-Right

                const w = p2.x - p1.x;
                const h = p2.y - p1.y;

                ctx.fillStyle = color;
                ctx.fillRect(Math.floor(p1.x), Math.floor(p1.y), Math.ceil(w), Math.ceil(h));
            });
        };

        const onMapClick = (e) => {
            if (map.getZoom() < 3) return;

            // Only allow painting if connected? For now allow anonymous or check key
            const walletAddress = publicKey ? publicKey.toString() : null;

            const { lat, lng } = e.latlng;
            const latIdx = Math.floor(lat / GRID_STEP);
            const lngIdx = Math.floor(lng / GRID_STEP);
            const key = `${latIdx},${lngIdx}`;

            if (socket) {
                if (selectedColor === 'ERASER') {
                    socket.emit('erase_pixel', { key, walletAddress });
                } else {
                    socket.emit('paint_pixel', { key, color: selectedColor, walletAddress });
                }
            }
        };

        map.on('move', draw);
        map.on('zoom', draw);
        map.on('resize', draw);
        map.on('click', onMapClick);

        draw();

        return () => {
            map.off('resize', draw);
            map.off('click', onMapClick);
        };
    }, [map, pixels, selectedColor, publicKey, socket]);

    return (
        <canvas
            ref={canvasRef}
            style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, zIndex: 500 }}
        />
    );
}

// Esri World Physical
const BASE_LAYER_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
// Esri World Gray Reference
const LABEL_LAYER_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}";



export default function WorldMap() {
    const selectedColor = '#808080'; // Hardcoded neutral color since Picker is gone
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAllianceOpen, setIsAllianceOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(true); // Open by default
    const [allianceUpdateTrigger, setAllianceUpdateTrigger] = useState(0);
    const [hasToken, setHasToken] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(false);
    const { publicKey, connected } = useWallet();

    // Manage socket in top-level state
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, []);

    // Check token balance when wallet connects
    useEffect(() => {
        const checkBalance = async () => {
            if (connected && publicKey) {
                setIsCheckingToken(true);
                const result = await checkTokenBalance(publicKey.toString());
                setHasToken(result.hasToken);
                setIsCheckingToken(false);

                // Close info modal if user has token
                if (result.hasToken) {
                    setIsInfoOpen(false);
                }
            } else {
                setHasToken(false);
            }
        };
        checkBalance();
    }, [connected, publicKey]);

    const handleAllianceUpdate = () => {
        setAllianceUpdateTrigger(prev => prev + 1);
    };



    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <MapContainer
                center={[20, 0]}
                zoom={4} // Start slightly zoomed out
                minZoom={3} // Allow seeing whole world
                maxZoom={23}
                scrollWheelZoom={true}
                zoomControl={false}
                attributionControl={false}
                zoomSnap={1} // Force integer steps
                zoomDelta={1} // 1 level per click
                style={{ height: "100%", width: "100%", backgroundColor: '#f8f9fa' }}
            >
                <ZoomIndicator />

                <TileLayer
                    url={BASE_LAYER_URL}
                    maxNativeZoom={16}
                    maxZoom={23}
                />
                <TileLayer
                    url={LABEL_LAYER_URL}
                    maxNativeZoom={16}
                    maxZoom={23}
                />
                <GridOverlay selectedColor={selectedColor} socket={socket} />
            </MapContainer>

            {/* UI LAYER (Outside MapContext) */}
            {/* Top Left Logo */}
            <img
                src="/Logo.svg"
                alt="PIXELNATION Logo"
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    height: '50px',
                    width: 'auto',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))'
                }}
            />
            {/* Top Right UI Container */}
            <div
                style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
            >
                {/* Top Row - Buttons */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsInfoOpen(true)}
                        style={{
                            padding: '10px 16px',
                            height: '44px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            color: 'white',
                            border: '2px solid #555',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                        title="How to Play"
                    >
                        ❓ How to Play
                    </button>
                    <button
                        onClick={() => setIsAllianceOpen(true)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            color: 'white',
                            border: '2px solid #555',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            height: '44px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                    >
                        🛡️ Alliance
                    </button>
                    <button
                        onClick={() => setIsProfileOpen(true)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            color: 'white',
                            border: '2px solid #555',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            height: '44px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                    >
                        👤 Profile
                    </button>
                    <WalletMultiButton style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        color: 'white',
                        border: '2px solid #555',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        height: '44px',
                        lineHeight: '40px',
                        padding: '0 20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }} />
                </div>

                {/* Token Stats - Below wallet */}
                <TokenStats />
            </div>

            <InfoModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                hasToken={hasToken}
                isCheckingToken={isCheckingToken}
                isConnected={connected}
            />
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <AllianceDashboard
                isOpen={isAllianceOpen}
                onClose={() => setIsAllianceOpen(false)}
                onAllianceUpdate={handleAllianceUpdate}
            />
            <AllianceChat socket={socket} allianceUpdateTrigger={allianceUpdateTrigger} />
            <Leaderboard />
        </div>
    );
}
