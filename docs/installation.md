
# HoneyChain – Installation and Setup Guide

## 1. Prerequisites

Before installing HoneyChain, make sure the following tools are installed:

- Node.js (v24 or compatible version)
- npm
- Git
- MongoDB Atlas account or a local MongoDB instance
- MetaMask wallet (for blockchain interaction, if required)
- Visual Studio Code (recommended)

## 2. Clone the Repository

Clone the project from GitHub:

```bash
git clone https://github.com/omsingh-blip/HoneyChain.git
```

Navigate to the project directory:

```bash
cd HoneyChain
```

## 3. Project Structure

```text
HoneyChain/
├── client/
├── server/
├── blockchain/
├── docs/
└── README.md
```

## 4. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using the provided `.env.example` as a reference.

Configure the required backend environment variables, including:

- PORT
- NODE_ENV
- CLIENT_URL
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- BLOCKCHAIN_RPC_URL
- BLOCKCHAIN_CONTRACT_ADDRESS
- BLOCKCHAIN_PRIVATE_KEY

Use your own database connection string, JWT secret, and blockchain configuration. Never commit your `.env` file.

Start the backend development server:

```bash
npm run dev
```

The backend runs locally at:

```text
http://localhost:5000
```

The API base URL is:

```text
http://localhost:5000/api
```

## 5. Frontend Setup

Open another terminal and navigate to the client directory:

```bash
cd HoneyChain/client
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure the backend API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal.

## 6. Blockchain Setup

Open another terminal and navigate to the blockchain directory:

```bash
cd HoneyChain/blockchain
```

Install dependencies:

```bash
npm install
```

Configure the blockchain environment if required by the Hardhat configuration.

Compile the smart contract:

```bash
npm run compile
```

The compiled contract artifacts are generated inside:

```text
blockchain/artifacts/
```

The backend uses the compiled HoneyChain contract artifact to interact with the deployed smart contract.

## 7. Running the Complete Application

For local development, keep the following processes running in separate terminals:

| Component | Command | Purpose |
|---|---|---|
| Backend | `npm run dev` | Runs the Express API |
| Frontend | `npm run dev` | Runs the React application |
| Blockchain | `npm run compile` | Compiles the smart contract |

Make sure the MongoDB connection and blockchain configuration are valid before testing blockchain functionality.

## 8. Environment Variable Security

- Never upload `.env` files to GitHub.
- Keep JWT secrets private.
- Never expose blockchain private keys in frontend code.
- Use environment variables for API and blockchain configuration.
- Use `.env.example` files to document required configuration without exposing credentials.

## 9. Troubleshooting

### Backend cannot connect to MongoDB

Check the MongoDB connection string and database network access configuration.

### Frontend cannot communicate with backend

Verify `VITE_API_URL` and the backend CORS configuration.

### Smart contract artifact not found

Navigate to the blockchain directory and run:

```bash
npm run compile
```

### Port already in use

Stop the existing process or configure a different available port.

## 10. Completion

After completing these steps, the HoneyChain application should be ready for local development and testing.
