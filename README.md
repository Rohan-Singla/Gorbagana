# 🎮 Gorbagana Coin Flip Game

A two-player coin flip game built on the [Gorbagana Testnet](https://x.com/Gorbagana_chain), enabling players to duel with $GOR tokens in a trustless commit-reveal setup.

---

## 🕹️ Game Overview

- Two players join a lobby and commit a secret (hashed).
- Once both players have committed, they reveal their secrets.
- The XOR of the hashed secrets determines the winner fairly.
- The winner receives the combined prize pool.
- Frontend built with Next.js + Tailwind + Framer Motion for a clean, animated UI.

---

## 🔗 Gorbagana Integration

- Uses Solana-compatible Gorbagana testnet RPC for all blockchain interactions.
- SPL token logic integrated for $GOR transfers using `@solana/spl-token`.
- Commit-reveal logic is stored off-chain, while payouts use on-chain token transfers.
- Vault-based payout system (currently hardcoded) for distributing prize.

---

## 🚀 Demo

👉 [Demo Video](https://www.canva.com/design/DAGsG9sIDRY/OvJgrF5hs5WQaOmaWPKMjQ/edit?utm_content=DAGsG9sIDRY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

---

## 🛠️ Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/Rohan-Singla/Gorbagana.git
cd Gorbagana
```

### 2. Add Frontend ENV Variables

```bash
NEXT_PUBLIC_GORBAGANA_RPC=https://rpc.gorbagana.wtf
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### 3. Run Frontend

```bash
cd frontend
pnpm i
pnpm dev
```

### 4. Add Backend ENV Variables

```bash
PRIVATE_KEY_BASE58=
PORT=4000
GOR_TOKEN_MINT=
RPC_URL=https://rpc.gorbagana.wtf
DATABASE_URL=
```
### 5.  Run Backend

```bash
cd backend
pnpm i
npx prisma generate
npx prisma migrate dev --name init
pnpm dev
```


