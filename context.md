Project Blueprint: WorldWar ($MAP) - Master Context
1. Project Overview
Name: WorldWar ($MAP) Platform: Solana (Token launch on Pump.fun). Concept: A decentralized, real-time "pixel war" played on a geographic map of the Earth (clone of wplace.live). Core Utility: Token-gated influence. Holding $MAP tokens increases drawing power, unlocks tools, and reduces cooldowns.

2. Core Mechanics
The application is a Geo-Spatial Canvas.

Map Interface: Users navigate a real-world map (OpenStreetMap).

Pixel Grid: At high zoom levels (>15), a grid overlay appears. Users paint pixels on this grid.

Persistence: Pixels are permanent (until painted over by someone else).

Economy: Users spend "Droplets" (soft currency) to paint. Droplets regenerate over time or are refilled by spending $MAP (hard currency).

3. Feature Specifications
A. User Profile & Nationalism
Identity: Users must connect a Solana Wallet.

Profile Data:

Username: Custom display name.

Flag: Country flag icon (user selected) displayed next to the name.

Level: Calculated based on total pixels painted.

Rank: Global ranking based on pixel count.

Visuals: Tooltips on the map show "Painted by [Name] [Flag]".

B. The Economy (Store)
Soft Currency (Droplets):

Used to paint pixels (1 pixel = 1 Droplet).

Regenerates automatically (e.g., +1 per minute).

Cap: Default 60. Can be increased via Store.

Hard Currency ($MAP Token):

The Store Modal: Users spend $MAP to buy upgrades.

Item 1: "Max Charge Upgrade" (+50 to Max Droplet Cap).

Item 2: "Instant Refill" (Fill Droplets to max instantly).

Implementation: Backend verifies on-chain transaction signatures before granting items.

C. Alliance System (Clans)
Function: Users can create or join an Alliance.

Scoring: Every pixel painted by a member contributes to the Alliance's total score.

Territory: If an area is dominated by an Alliance, the map UI should reflect their dominance (optional visual flair).

Social: Alliance Chat link (Discord/Telegram) displayed in the Alliance info.

D. Leaderboards
Player Leaderboard: Top 100 users by Total Pixels Painted.

Alliance Leaderboard: Top 100 Alliances by Total Score.

Timeframes: All-time vs. Weekly (to keep competition fresh).

E. Search & Navigation
Geo-Search: Search for cities ("New York", "Paris") using OpenStreetMap API -> Fly to location.

User-Search: Search for a Username -> Fly to their last painted pixel.

4. Technical Architecture
Frontend
Framework: React (Vite).

Map Engine: react-leaflet (Leaflet.js) + OpenStreetMap Tiles.

Overlay: Custom HTML5 Canvas Layer (L.Canvas) for high-performance pixel rendering.

Web3: @solana/wallet-adapter-react.

State: React Context or Zustand for User/Store state.

Backend
Runtime: Node.js (Express).

Database:

Pixel Storage: Redis or In-Memory Map (Key: "lat_lng", Value: {color, owner, timestamp}).

User/Alliance Data: MongoDB or PostgreSQL (for persistent profiles, stats, and transaction history).

Real-time: socket.io (Events: paint, update, alliance_join).

Blockchain: @solana/web3.js (for verifying Store transactions and checking Token Balances).

5. Data Models
User Schema:

JSON

{
  "walletAddress": "String (PK)",
  "username": "String",
  "flag": "String (ISO Code)",
  "droplets": "Integer",
  "maxDroplets": "Integer (Default: 60)",
  "lastRefill": "Timestamp",
  "totalPixels": "Integer",
  "allianceId": "UUID (Optional)",
  "inventory": ["bomb_tool", "shield"]
}
Alliance Schema:

JSON

{
  "id": "UUID",
  "name": "String",
  "tag": "String (e.g., [USA])",
  "ownerWallet": "String",
  "score": "Integer",
  "members": ["walletAddress1", "walletAddress2"]
}
6. Implementation Phases (AI Prompt Guide)
Phase 1: Map & Grid (Frontend core).

Phase 2: Multiplayer Sync (Socket.io).

Phase 3: User Profiles & Database.

Phase 4: Alliance System.

Phase 5: The Store & Solana Verification (Crucial).