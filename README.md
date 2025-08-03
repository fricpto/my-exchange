# 🧾 MyExchange

**MyExchange** is a decentralized application (dApp) that enables users to trade ERC-20 mock tokens through a fully on-chain mechanism. It allows users to place custom buy or sell offers by specifying price and amount. Orders are stored in a contract-based order book and matched directly on-chain, without relying on AMM-style pools.

Built with **Solidity**, **React**, **Redux**, and **Hardhat**, this project includes a working frontend, backend contract logic, token support, price charting, multi-network deployment (Sepolia, Amoy, Localhost), and a trade fee (e.g., 10%) set at deployment and sent to a designated fee recipient.

---

## 🚀 Live Demo

🔗 [Launch dApp](https://incalculable-denmark-purring.on-fleek.app/)

---

## 🔧 Features

- ✅ Deposit & withdraw ERC-20 tokens
- ✅ Place buy/sell orders with custom price and amount
- ✅ On-chain order book with matching logic
- ✅ View open orders and trade history
- ✅ Cancel orders (to update an order, cancel and place a new one)
- ✅ Chart token price data
- ✅ Connect via MetaMask
- ✅ Choose market (e.g., `mUSD/mBNB`, `mUSD/mTHETA`)
- ✅ Select network (Localhost, Sepolia, Amoy)
- ✅ Configurable trade fee set during deployment (e.g., 10%) and sent to a designated fee receiver

---

## 🪙 Supported Tokens

These are mock ERC-20 tokens deployed for demo and testing purposes:

| Token     | Symbol    |
|-----------|-----------|
| mBNB      | `mBNB`    |
| Mock THETA| `mTHETA`  |
| Mock USD  | `mUSD`    |

---

## 🔄 Supported Trading Pairs

- `mUSD / mBNB`
- `mUSD / mTHETA`

---

## 🛠️ Tech Stack

**Frontend**
- React 18
- Redux + Redux Thunk
- React-ApexCharts (for charting)
- Ethers.js
- dotenv

**Backend / Smart Contracts**
- Solidity
- Hardhat
- Hardhat Toolbox
- Ethers 5
- Chai (testing)

---

## 📂 Project Structure


```
my-exchange/
├── contracts/ # Exchange and token contracts
├── scripts/ # Deployment + seed scripts
├── src/ # Frontend logic, components, store, abis, config
│ ├── components/ # UI components (OrderBook, TradeForm, etc.)
│ ├── store/ # Redux store + reducers + interactions.js + selectors.js
│ ├── assets/ # Token logos and icons
│ ├── abis/ # Contract ABIs
│ └── config.json # Token config per network
├── test/ # Hardhat tests
├── .env.example # Environment variable template
├── hardhat.config.js # Hardhat setup
├── package.json # NPM scripts and dependencies
└── README.md
```

## 🧰 Requirements
Make sure you have the following installed:

- **Node.js (v18 or later)** – [Download](https://nodejs.org/en)  
 ➤ Check version: `node -v`

- Hardhat – Install with:

```bash
npm install --save-dev hardhat
```  
 ➤ Verify: `npx hardhat --version`

- React  
➤ Included via package.json  
➤ Check version: `npm list react`

- Redux  
➤ Already configured via `redux`, `react-redux`, and `redux-thunk`
➤ [Redux DevTools Extension (Chrome)](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)  
➤ Optional but recommended for debugging application state

- Solidity  
➤ Specified in hardhat.config.js  
➤ Verify with: Check pragma version in your contracts and compare with `hardhat.config.js`.

- MetaMask  
➤ For browser-based wallet connection


## 📦 Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/fricpto/my-exchange
cd my-exchange
```
### 2. Install dependencies

```
npm install
```

### 3. Run the dApp locally

```
npm run start
```
### 4. Deploy contracts locally

Open Terminal 1:

```
npx hardhat node
```

Open Terminal 2:

```
npx hardhat run scripts/1_deploy.js --network localhost
```

After deployment, copy the generated token contract addresses and update them in: `src/config.json`

Open Terminal 3:

```
npx hardhat run scripts/2_seed-exchange.js --network localhost
```

## 🧪 Testing
Use Hardhat for testing smart contracts:

```
npx hardhat test
```


### 🌐 Deploy to Testnet

To run the dApp on Sepolia or Amoy, deploy your contracts:

```
npx hardhat run scripts/1_deploy.js --network <sepolia or amoy>
```

Then update the new token addresses in: `src/config.json`

Start the frontend again:

```
npm run start
```


## 🙋 About the Author  
Made with 🛠️ by [fricpto](https://github.com/fricpto)