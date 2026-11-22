# HoneyChain – Deployment Guide

## 1. Introduction

HoneyChain consists of three main application components:

1. **Frontend:** React application built with Vite and deployed on Netlify.
2. **Backend:** Node.js and Express API deployed on Render.
3. **Blockchain:** Solidity smart contract deployed on the Ethereum Sepolia test network using Hardhat.

MongoDB is used as the application's database for storing user, hive and honey batch information.

## 2. Deployment Architecture

| Component | Technology | Hosting / Network |
|---|---|---|
| Frontend | React, Vite, Tailwind CSS | Netlify |
| Backend | Node.js, Express.js | Render |
| Database | MongoDB | MongoDB |
| Smart Contract | Solidity, Hardhat | Ethereum Sepolia |
| Blockchain Interaction | ethers.js | Sepolia RPC |

### Production URLs

- Frontend: https://honeychainapito.netlify.app
- Backend: https://honeychain-kram.onrender.com
- API Base URL: https://honeychain-kram.onrender.com/api
- Smart Contract: `0xCFA2B16D146C17d26D76269A6d98dF52Ea539045`
- Blockchain Explorer: https://sepolia.etherscan.io/address/0xCFA2B16D146C17d26D76269A6d98dF52Ea539045

## 3. Frontend Deployment – Netlify

The frontend is built using React and Vite.

### 3.1 Netlify Configuration

The project contains a root-level `netlify.toml` configuration file:

```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"
```

This configuration specifies:

- Base directory: `client`
- Build command: `npm run build`
- Published directory: `dist`

### 3.2 Build Process

To build the frontend locally:

```bash
cd client
npm install
npm run build
```

Vite generates the production build inside the `client/dist` directory.

### 3.3 Deploying on Netlify

1. Push the project repository to GitHub.
2. Sign in to Netlify.
3. Create a new site by importing the GitHub repository.
4. Allow Netlify to detect the root-level `netlify.toml` configuration.
5. Confirm the build settings.
6. Start the deployment.

After successful deployment, Netlify publishes the frontend application.

### 3.4 Frontend Environment Configuration

Configure the production API endpoint using the environment variable expected by the frontend source code.

The production API base URL is:

```text
https://honeychain-kram.onrender.com/api
```

The exact environment variable name should match the frontend API configuration.

## 4. Backend Deployment – Render

The backend is developed using Node.js and Express.js. It provides REST APIs for authentication, hive management and honey batch operations.

### 4.1 Backend Configuration

The backend uses the following environment variables, defined in `server/.env.example`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/honeychain
JWT_SECRET=randomlyGeneratedSecretKey
JWT_EXPIRES_IN=1d
```

For production, configure the environment variables in the Render dashboard.

- `PORT`: Port used by the backend service.
- `CLIENT_URL`: Production frontend URL for cross-origin requests.
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret used for signing and verifying authentication tokens.
- `JWT_EXPIRES_IN`: JWT expiration duration.

The production `CLIENT_URL` should point to the deployed Netlify application. The MongoDB connection string and JWT secret must contain the actual production values.

### 4.2 Render Build and Start Configuration

Configure the Render service using:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |

The backend package defines the following scripts:

```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js"
}
```

The `start` script launches the production Express server.

### 4.3 Database Connection

The backend connects to MongoDB using the `MONGODB_URI` environment variable.

Before deployment:

1. Create or select a MongoDB database.
2. Configure the database user's credentials.
3. Configure network access for the deployed backend.
4. Add the MongoDB connection string to Render's environment variables.

### 4.4 CORS Configuration

The backend uses the `CLIENT_URL` environment variable to identify the frontend origin.

For production, configure it with:

```text
https://honeychainapito.netlify.app
```

This allows the deployed frontend to communicate with the backend API, subject to the server's CORS configuration.

## 5. Smart Contract Deployment – Ethereum Sepolia

HoneyChain uses a Solidity smart contract to record and verify honey batch metadata hashes.

The contract is developed in:

```text
blockchain/contracts/HoneyChain.sol
```

The project uses:

- Solidity version: `0.8.28`
- Hardhat version: `2.x`
- Network: Ethereum Sepolia
- Chain ID: `11155111`

### 5.1 Hardhat Configuration

The project configures local and Sepolia networks in `blockchain/hardhat.config.cjs`.

The Sepolia configuration uses:

- `SEPOLIA_RPC_URL`: RPC endpoint for connecting to Sepolia.
- `SEPOLIA_PRIVATE_KEY`: Private key of the deployment wallet.

These values must be stored securely in `blockchain/.env` and must never be committed to GitHub or shared publicly.

### 5.2 Installing Blockchain Dependencies

```bash
cd blockchain
npm install
```

### 5.3 Compiling the Smart Contract

Run:

```bash
npx hardhat compile
```

Hardhat compiles the Solidity contract and generates the required artifacts.

### 5.4 Deploying the Contract

The project contains a deployment script at:

```text
blockchain/scripts/deploy.cjs
```

The deployment should be executed using the Sepolia network after configuring valid RPC credentials and a funded deployment wallet.

Standard Hardhat deployment command:

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

After deployment, record the newly generated contract address and transaction details.

### 5.5 Verifying Deployment

The deployed contract can be inspected using the Sepolia Etherscan explorer.

The contract address is used by the backend to interact with the deployed smart contract.

If a new contract is deployed, update the backend configuration with the new contract address and ensure that the correct ABI and network settings are used.

## 6. Environment Variables and Security

The application requires separate environment configurations for the backend and blockchain components.

### Backend

```env
PORT=5000
CLIENT_URL=YOUR_FRONTEND_URL
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECURE_JWT_SECRET
JWT_EXPIRES_IN=1d
```

### Blockchain

```env
SEPOLIA_RPC_URL=YOUR_SEPOLIA_RPC_URL
SEPOLIA_PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
```

### Security Guidelines

- Never commit `.env` files to GitHub.
- Never share wallet private keys or RPC API credentials.
- Use strong and unique JWT secrets.
- Restrict database network access to trusted sources.
- Store production credentials in the hosting platform's environment settings.
- Use a dedicated deployment wallet rather than a wallet containing valuable personal assets.
- Replace any credentials that have been exposed.

## 7. Post-Deployment Verification

After deploying the application, perform the following checks:

1. Open the Netlify frontend and confirm that the landing page loads.
2. Register a new user and verify authentication.
3. Log in and open the dashboard.
4. Register a hive and verify that it appears in Hive Management.
5. Create a honey batch using an active hive.
6. Check that the batch appears in Honey Batches.
7. Generate its QR code.
8. Open the public verification page using the QR code.
9. Confirm that the batch information is displayed.
10. Check the blockchain verification result and transaction details.

Also verify that the Render backend is running and can connect to MongoDB.

## 8. Conclusion

HoneyChain uses a distributed deployment architecture in which the frontend, backend, database and blockchain operate as separate components.

Netlify hosts the user interface, Render runs the backend API, MongoDB stores application records, and Ethereum Sepolia provides blockchain-based batch hash verification.

This architecture allows the application to combine conventional web application functionality with blockchain-backed data integrity and public honey traceability.