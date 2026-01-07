import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import ColorPicker from './components/ColorPicker';
import ProfileModal from './components/ProfileModal';
import AllianceDashboard from './components/AllianceDashboard';
import AllianceChat from './components/AllianceChat';

// 0.05 degrees is roughly 5.5km (Strategy Game Scale)
const GRID_STEP = 0.05;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Zoom Indicator Component
function ZoomIndicator() {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useMapEvent('zoom', () => {
        setZoom(map.getZoom());
    });

    return (
        <div style={{
            position: 'absolute', bottom: 20, right: 20, zIndex: 10000,
            padding: '5px 10px', backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white', borderRadius: '4px', fontSize: '14px',
            pointerEvents: 'none', userSelect: 'none',
            fontFamily: 'monospace',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            Zoom: {zoom}x
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

        return () => {
            socket.off('connect');
            socket.off('init_state');
            socket.off('pixel_update');
            socket.off('pixel_erase');
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

            // Draw Grid Lines - DISABLED
            // ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            // ...
            /*
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            // ... grid drawing code removed ...
            
            ctx.stroke();
            */
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
    }, [map, pixels, selectedColor, publicKey, socket]); // Re-bind when pixels, color, or WALLET changes

    return (
        <canvas
            ref={canvasRef}
            style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, zIndex: 500 }}
        />
    );
}

// Esri World Physical: Clean terrain + borders, no roads.
// Note: Native zoom only goes to ~8. We scale update for high zoom (pixel war focus).
// Esri World Gray Canvas: Lightweight, clean, "line only" feel.
const BASE_LAYER_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
// Esri World Gray Reference: Labels and borders overlay
const LABEL_LAYER_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}";



export default function WorldMap() {
    const [selectedColor, setSelectedColor] = useState('#FF4500'); // Default Orange Red
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAllianceOpen, setIsAllianceOpen] = useState(false);

    // Manage socket in top-level state
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, []);

    return (
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
            style={{ height: "100vh", width: "100vw", backgroundColor: '#f8f9fa' }}
        >
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => setIsAllianceOpen(true)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#FFD700',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        height: '48px'
                    }}
                >
                    🛡️ Alliance
                </button>
                <button
                    onClick={() => setIsProfileOpen(true)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#512da8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        height: '48px' // Match WalletButton height approx
                    }}
                >
                    👤 Profile
                </button>
                <button
                    onClick={() => {
                        // SPRAY "WORLD RAID" LOGIC
                        if (!socket) return;
                        const updates = [];
                        const startLat = 0; // Equator
                        const startLng = 15; // Congo
                        const color = '#FFD700'; // Gold

                        // Simple Bitmap Font (5x5) 'X' marks the spot
                        const letters = {
                            W: [[0, 0], [0, 4], [1, 0], [1, 4], [2, 0], [2, 2], [2, 4], [3, 0], [3, 4], [4, 0], [4, 4]],
                            O: [[0, 1], [0, 2], [0, 3], [1, 0], [1, 4], [2, 0], [2, 4], [3, 0], [3, 4], [4, 1], [4, 2], [4, 3]],
                            R: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 4], [2, 0], [2, 1], [2, 2], [2, 3], [3, 0], [3, 2], [4, 0], [4, 3]],
                            L: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3]],
                            D: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 3], [2, 0], [2, 3], [3, 0], [3, 3], [4, 0], [4, 1], [4, 2]],
                            A: [[0, 2], [1, 1], [1, 3], [2, 0], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [4, 0], [4, 4]],
                            I: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1], [3, 1], [4, 0], [4, 1], [4, 2]],
                        };

                        const text = "WORLD RAID";
                        let cursorLng = 0; // Relative pointer

                        for (const char of text) {
                            if (char === ' ') {
                                cursorLng += 4;
                                continue;
                            }
                            const pattern = letters[char] || []; // default empty if unknown

                            // Scale: 1 (One grid cell = one significant block now)
                            const scale = 1;

                            pattern.forEach(([r, c]) => {
                                const latVal = startLat - (r * GRID_STEP);
                                const lngVal = startLng + (cursorLng + c) * GRID_STEP;

                                const latIdx = Math.floor(latVal / GRID_STEP);
                                const lngIdx = Math.floor(lngVal / GRID_STEP);
                                updates.push({ key: `${latIdx},${lngIdx}`, color });
                            });
                            cursorLng += 5 + 1; // 5 width + spacing
                        }

                        console.log(`Sending batch_paint with ${updates.length} pixels...`);
                        socket.emit('batch_paint', { updates, walletAddress: 'API_TESTER' });
                        alert(`Sprayed ${updates.length} pixels at [0, 15] (Africa)! Zoom to 10x to see.`);
                    }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#ff0000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        height: '48px',
                        zIndex: 9999
                    }}
                >
                    🧪 SPRAY
                </button>
                <WalletMultiButton />
            </div>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <AllianceDashboard isOpen={isAllianceOpen} onClose={() => setIsAllianceOpen(false)} />
            <AllianceChat socket={socket} />
            <ZoomIndicator />

            <ColorPicker selectedColor={selectedColor} onSelectColor={setSelectedColor} />

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
    );
}
