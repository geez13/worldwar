import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Docs() {
    const mainContentRef = useRef(null);
    const location = useLocation();

    // Scroll to top on mount
    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0;
        }
    }, [location.pathname]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element && mainContentRef.current) {
            // Calculate offset relative to the scroll container
            const container = mainContentRef.current;
            const elementTop = element.getBoundingClientRect().top;
            const containerTop = container.getBoundingClientRect().top;
            const offset = elementTop - containerTop + container.scrollTop - 40; // 40px padding

            container.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div style={{
            backgroundColor: '#121212',
            color: '#e0e0e0',
            height: '100vh',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            display: 'flex',
            lineHeight: '1.6',
            overflow: 'hidden' // Prevent body scroll
        }}>
            {/* Sidebar */}
            <div style={{
                width: '280px',
                height: '100%',
                flexShrink: 0,
                borderRight: '1px solid #333',
                backgroundColor: '#181818',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Sidebar Scrollable Content (Logo + Nav) */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Logo Area */}
                    <div style={{ marginBottom: '40px' }}>
                        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <img src="/Logo.svg" alt="PixelNation" style={{ height: '32px' }} />
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', letterSpacing: '0.5px' }}>PIXELNATION</span>
                        </Link>
                        <div style={{
                            color: '#666',
                            fontSize: '13px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            paddingLeft: '42px' // Align with text start
                        }}>
                            Documentation
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {['Introduction', 'How It Works', 'Alliance System', 'Tokenomics', 'Roadmap'].map((item) => {
                            const id = item === 'Introduction' ? 'introduction' : item.toLowerCase().replace(/ /g, '-');
                            return (
                                <button
                                    key={item}
                                    onClick={() => scrollToSection(id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        textAlign: 'left',
                                        padding: '10px 12px',
                                        color: '#bbb',
                                        cursor: 'pointer',
                                        fontSize: '15px',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.color = 'white'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#bbb'; }}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Fixed Footer (Social + Back) */}
                <div style={{
                    padding: '24px',
                    borderTop: '1px solid #2a2a2a',
                    backgroundColor: '#181818',
                    flexShrink: 0
                }}>

                    {/* Social Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <a href="https://x.com/PIXELNATION_SOL" target="_blank" rel="noopener noreferrer"
                            style={{
                                flex: 1, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#252525', borderRadius: '8px', transition: 'all 0.2s', border: '1px solid #333'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#303030'; e.currentTarget.style.borderColor = '#555'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#252525'; e.currentTarget.style.borderColor = '#333'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href="https://t.me/pixelnation_sol" target="_blank" rel="noopener noreferrer"
                            style={{
                                flex: 1, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#252525', borderRadius: '8px', transition: 'all 0.2s', border: '1px solid #333'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#303030'; e.currentTarget.style.borderColor = '#555'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#252525'; e.currentTarget.style.borderColor = '#333'; }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                        </a>
                    </div>

                    <Link to="/" style={{
                        display: 'block',
                        backgroundColor: '#eee', color: '#111', padding: '12px', borderRadius: '8px',
                        textDecoration: 'none', fontWeight: '700', fontSize: '14px', textAlign: 'center',
                        transition: 'all 0.2s', border: '1px solid #ccc'
                    }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#eee'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        ← Back to Game
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div
                ref={mainContentRef}
                style={{
                    flex: 1,
                    height: '100%',
                    overflowY: 'auto',
                    scrollBehavior: 'smooth'
                }}
            >
                <div style={{
                    maxWidth: '960px',
                    margin: '0 auto',
                    padding: '60px 80px 100px 80px'
                }}>

                    {/* Hero / Intro Section */}
                    <div id="introduction" style={{ marginBottom: '80px', paddingTop: '20px' }}>
                        <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', color: 'white', letterSpacing: '-0.5px' }}>
                            Introduction
                        </h1>
                        <p style={{ fontSize: '22px', color: '#aaaaaa', lineHeight: '1.5', marginBottom: '40px' }}>
                            The World's First Decentralized Territory Conquest Game on Solana.
                        </p>

                        <div style={{ padding: '24px', backgroundColor: '#1e1e1e', borderRadius: '12px', borderLeft: '4px solid #4db6ac' }}>
                            <p style={{ margin: 0, color: '#e0e0e0', fontSize: '16px', lineHeight: '1.7' }}>
                                <strong>PIXELNATION</strong> is a real-time multiplayer strategy game where players form alliances and compete to dominate the world map, one pixel at a time.
                            </p>
                        </div>
                    </div>

                    {/* How It Works */}
                    <section id="how-it-works" style={{ marginBottom: '100px' }}>
                        <h2 style={{ fontSize: '30px', fontWeight: '700', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '30px', color: 'white' }}>
                            🎮 How It Works
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '20px' }}>
                            {[
                                { title: "1. Connect Wallet", icon: "🔌", desc: "Link your Solana wallet to enter the arena.", link: "/" },
                                { title: "2. Get $PXN", icon: "🪙", desc: "You need at least 1 $PXN token to play and paint.", link: "https://pump.fun/" },
                                { title: "3. Join Alliance", icon: "🛡️", desc: "Join an existing alliance or create your own (requires 1% supply).", link: "/" },
                                { title: "4. Conquer", icon: "🖌️", desc: "Paint pixels on the global map. Your pixels stay until conquered.", link: "/" },
                            ].map((step, i) => {
                                const isExternal = step.link.startsWith('http');
                                const CardContent = (
                                    <div style={{ backgroundColor: '#1e1e1e', padding: '24px', borderRadius: '12px', border: '1px solid #333', display: 'flex', gap: '24px', alignItems: 'flex-start', transition: 'border-color 0.2s, transform 0.2s' }}
                                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4db6ac'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ fontSize: '32px', lineHeight: '1' }}>{step.icon}</div>
                                        <div>
                                            <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>{step.title} &rarr;</h3>
                                            <p style={{ color: '#aaa', fontSize: '15px', margin: 0, lineHeight: '1.6' }}>{step.desc}</p>
                                        </div>
                                    </div>
                                );

                                return isExternal ? (
                                    <a key={i} href={step.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                        {CardContent}
                                    </a>
                                ) : (
                                    <Link key={i} to={step.link} style={{ textDecoration: 'none' }}>
                                        {CardContent}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Alliance System */}
                    <section id="alliance-system" style={{ marginBottom: '100px' }}>
                        <h2 style={{ fontSize: '30px', fontWeight: '700', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '30px', color: 'white' }}>
                            🛡️ Alliance System
                        </h2>
                        <p style={{ fontSize: '16px', marginBottom: '24px', color: '#ccc' }}>Alliances are the heart of PIXELNATION. Every pixel you paint counts toward your alliance's total score.</p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '16px' }}>
                            {[
                                "Unique Colors — 50 distinct colors, first come first served.",
                                "Permanent Identity — Name and tag are set forever.",
                                "Alliance Chat — Coordinate strategies with your team in real-time.",
                                "Shared Glory — Dominate the leaderboard together."
                            ].map((point, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#1a1a1a', padding: '16px 20px', borderRadius: '10px' }}>
                                    <span style={{ color: '#4db6ac', fontSize: '18px', fontWeight: 'bold' }}>✓</span>
                                    <span style={{ color: '#ddd', fontSize: '16px' }}>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Tokenomics */}
                    <section id="tokenomics" style={{ marginBottom: '100px' }}>
                        <h2 style={{ fontSize: '30px', fontWeight: '700', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '30px', color: 'white' }}>
                            💎 Token Utility ($PXN)
                        </h2>
                        <div style={{ overflowX: 'auto', border: '1px solid #333', borderRadius: '12px', backgroundColor: '#181818' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#222', borderBottom: '1px solid #333' }}>
                                        <th style={{ padding: '20px', color: '#e0e0e0', fontWeight: '600', width: '30%' }}>Holding</th>
                                        <th style={{ padding: '20px', color: '#e0e0e0', fontWeight: '600' }}>Benefit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '20px', color: 'white', fontWeight: 'bold' }}>1+ $PXN</td>
                                        <td style={{ padding: '20px', color: '#ccc' }}>Access to play the game and paint pixels.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '20px', color: 'white', fontWeight: 'bold' }}>1% Supply</td>
                                        <td style={{ padding: '20px', color: '#ccc' }}>Ability to create and lead your own Alliance.</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '20px', color: 'white', fontWeight: 'bold' }}>Reviewer</td>
                                        <td style={{ padding: '20px', color: '#ccc' }}>Future perks: Faster cooldowns, special tools.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Roadmap */}
                    <section id="roadmap" style={{ marginBottom: '100px' }}>
                        <h2 style={{ fontSize: '30px', fontWeight: '700', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '30px', color: 'white' }}>
                            🗺️ Roadmap
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {[
                                { phase: "Phase 1: Foundation (Complete) ✅", items: ["World Map & Painting", "Alliance Creation", "Live Leaderboard", "Wallet Integration"] },
                                { phase: "Phase 2: Launch 🚀", items: ["Token Launch", "Marketing Campaign", "Community Building"] },
                                { phase: "Phase 3: Expansion 🔮", items: ["Weekly Rewards", "Advanced Tools (Bombs, Shields)", "Mobile Optimization"] },
                                { phase: "Phase 4: Evolution 🌟", items: ["Cross-chain Expansion", "NFT Integration", "Land Ownership Mechanics"] }
                            ].map((phase, i) => (
                                <div key={i} style={{
                                    borderLeft: '4px solid #4db6ac',
                                    paddingLeft: '25px',
                                    backgroundColor: '#1a1a1a',
                                    padding: '24px 24px 24px 28px',
                                    borderRadius: '0 12px 12px 0',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>{phase.phase}</h3>
                                    <ul style={{ paddingLeft: '20px', color: '#aaa', margin: 0, lineHeight: '1.6' }}>
                                        {phase.items.map((item, j) => <li key={j} style={{ marginBottom: '8px' }}>{item}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div style={{ textAlign: 'center', color: '#555', fontSize: '14px', paddingTop: '40px', borderTop: '1px solid #222' }}>
                        <p>&copy; {new Date().getFullYear()} PIXELNATION</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
