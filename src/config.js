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

// Buy $PXN Link - configurable via environment variable
export const BUY_PXN_URL = import.meta.env.VITE_BUY_PXN_URL || 'https://pump.fun';
