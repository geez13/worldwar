import React, { useState, useEffect } from 'react';
import { getTokenStats, formatMarketCap, formatHolders } from '../services/tokenService';
import { BUY_PXN_URL } from '../config';

const TokenStats = () => {
    const [stats, setStats] = useState({
        holders: null,
        marketCap: null,
        price: null,
        priceChange24h: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getTokenStats();
            setStats(data);
            setLoading(false);
        };

        fetchStats();

        // Refresh every 60 seconds
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const containerStyle = {
        display: 'flex',
        gap: '8px',
        marginTop: '8px'
    };

    const statBoxStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '2px solid #555',
        borderRadius: '8px',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '90px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    };

    const labelStyle = {
        fontSize: '10px',
        color: '#888',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    const valueStyle = {
        fontSize: '14px',
        color: 'white',
        fontWeight: '700',
        marginTop: '2px'
    };

    const handleClick = () => {
        window.open(BUY_PXN_URL, '_blank');
    };

    return (
        <div style={containerStyle}>
            <div
                style={statBoxStyle}
                onClick={handleClick}
                onMouseOver={e => {
                    e.currentTarget.style.borderColor = '#FF4500';
                    e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseOut={e => {
                    e.currentTarget.style.borderColor = '#555';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Click to buy $PXN"
            >
                <span style={labelStyle}>Holders</span>
                <span style={valueStyle}>
                    {loading ? '...' : formatHolders(stats.holders)}
                </span>
            </div>
            <div
                style={statBoxStyle}
                onClick={handleClick}
                onMouseOver={e => {
                    e.currentTarget.style.borderColor = '#FF4500';
                    e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseOut={e => {
                    e.currentTarget.style.borderColor = '#555';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Click to buy $PXN"
            >
                <span style={labelStyle}>Market Cap</span>
                <span style={valueStyle}>
                    {loading ? '...' : formatMarketCap(stats.marketCap)}
                </span>
            </div>
        </div>
    );
};

export default TokenStats;
