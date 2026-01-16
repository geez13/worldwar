import { TOKEN_CA, SOLANA_RPC_URL } from '../config';

/**
 * Check if a wallet holds the required token
 * @param {string} walletAddress - Solana wallet public key
 * @returns {Promise<{hasToken: boolean, balance: number}>}
 */
export async function checkTokenBalance(walletAddress) {
    try {
        // Get token accounts for the wallet
        const response = await fetch(SOLANA_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenAccountsByOwner',
                params: [
                    walletAddress,
                    { mint: TOKEN_CA },
                    { encoding: 'jsonParsed' }
                ]
            })
        });

        const data = await response.json();

        if (data.result && data.result.value && data.result.value.length > 0) {
            // Get the token balance
            const tokenAccount = data.result.value[0];
            const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount || 0;
            return { hasToken: balance > 0, balance };
        }

        return { hasToken: false, balance: 0 };
    } catch (error) {
        console.error('Error checking token balance:', error);
        return { hasToken: false, balance: 0 };
    }
}

/**
 * Fetch token stats from DexScreener API
 * @returns {Promise<{holders: number|null, marketCap: number|null, price: number|null}>}
 */
export async function getTokenStats() {
    try {
        // DexScreener API for Solana tokens
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CA}`);
        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
            // Get the most liquid pair (usually first)
            const pair = data.pairs[0];
            return {
                holders: pair.holders || null,
                marketCap: pair.marketCap || pair.fdv || null,
                price: parseFloat(pair.priceUsd) || null,
                priceChange24h: pair.priceChange?.h24 || null
            };
        }

        return { holders: null, marketCap: null, price: null, priceChange24h: null };
    } catch (error) {
        console.error('Error fetching token stats:', error);
        return { holders: null, marketCap: null, price: null, priceChange24h: null };
    }
}

/**
 * Format market cap for display
 * @param {number} value 
 * @returns {string}
 */
export function formatMarketCap(value) {
    if (!value) return '--';
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
}

/**
 * Format holders count for display
 * @param {number} value 
 * @returns {string}
 */
export function formatHolders(value) {
    if (!value) return '--';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
}
