// Dynamic Configuration
// Detects if running on localhost or LAN and sets the backend URL accordingly.

const getApiUrl = () => {
    // If VITE_SOCKET_URL is set in .env (e.g. for production), use it.
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }

    // Otherwise, construct based on the current hostname.
    // This allows LAN access (e.g. 192.168.x.x) to work automatically.
    // 3. Fallback logic
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    // Check if we are on Vercel but missing the config
    if (hostname.includes('vercel.app')) {
        console.warn("⚠️ WARNING: Running on Vercel but VITE_SOCKET_URL is missing!");
        console.warn("The app is trying to connect to itself, which will likely fail.");
        console.warn("Please set 'VITE_SOCKET_URL' in Vercel Environment Variables to your Backend URL.");
    }

    // Assume backend is on port 3000 regarding of protocol (HTTP/HTTPS) logic being split usually
    // But for LAN access, we usually want same protocol. 
    return `${protocol}//${hostname}:3000`;
};

export const API_URL = getApiUrl();
console.log("🔌 Socket URL configured to:", API_URL);

// Token Contract Address - configurable via environment variable
// Default is test token, replace with real $PXN CA in production
export const TOKEN_CA = import.meta.env.VITE_TOKEN_CA || 'nljtfes9waraj5ahhmfkp5fpmravzebvteptxeypump';

// Buy $PXN Link - uses token CA for pump.fun
export const BUY_PXN_URL = `https://pump.fun/coin/${TOKEN_CA}`;

// Solana RPC URL for token balance checks
export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
