
# HoneyChain – System Architecture

## 1. Overview

HoneyChain is a blockchain-based honey traceability and smart beekeeping platform. It allows users to manage beehives, maintain honey batch records, track processing stages, and verify product information using QR codes and blockchain records.

The application follows a client-server architecture integrated with MongoDB and the Ethereum blockchain.

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| State Management | Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Blockchain | Solidity, Hardhat, Ethers.js |
| Blockchain Network | Ethereum Sepolia |
| QR Codes | QR Code Generation |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

## 3. High-Level Architecture

```text
             USER
               |
               v
       React Frontend
         (Netlify)
               |
               | REST API
               v
       Express Backend
          (Render)
          /       \
         /         \
        v           v
   MongoDB       Blockchain
   Database      Service
                     |
                     v
                Ethers.js
                     |
                     v
              Ethereum Sepolia
                Smart Contract
```

## 4. Frontend Layer

The frontend provides the user interface for interacting with HoneyChain.

Main responsibilities:

- User registration and login.
- Dashboard and statistics.
- Beehive management.
- Honey batch creation and management.
- Batch status updates.
- QR code generation and downloading.
- Public honey batch verification.

The frontend communicates with the backend through REST API requests.

## 5. Backend Layer

The backend is developed using Node.js and Express.js.

Main responsibilities:

- Handling API requests.
- User authentication and authorization.
- Managing beehive records.
- Managing honey batches.
- Communicating with MongoDB.
- Interacting with the blockchain smart contract.
- Verifying batch information.

JWT is used for authentication, while bcryptjs is used for password hashing.

## 6. Database Layer

MongoDB stores the application's structured data.

It maintains information related to:

- User accounts.
- Beehives.
- Honey batches.
- Batch history and processing information.
- Blockchain transaction references.

Mongoose is used for database modeling and interaction.

## 7. Blockchain Layer

HoneyChain uses a Solidity smart contract deployed on the Ethereum Sepolia test network.

Hardhat is used for smart contract development and compilation.

Ethers.js allows the backend to communicate with the blockchain.

The blockchain layer supports recording and verifying batch information through blockchain transactions.

## 8. QR-Based Traceability

Each honey batch can be associated with a QR code.

The QR code allows users to access the public traceability page and inspect the available batch information.

The backend can also verify whether the batch data matches the hash recorded on the blockchain.

## 9. Deployment Architecture

| Component | Hosting |
|---|---|
| Frontend | Netlify |
| Backend API | Render |
| Database | MongoDB Atlas |
| Smart Contract | Ethereum Sepolia |

The frontend communicates with the deployed backend using the production API URL.

The backend connects to MongoDB Atlas and the Ethereum Sepolia network using environment configuration.

## 10. Security Considerations

- Password hashing using bcryptjs.
- JWT-based authentication.
- Role-based authorization.
- Input validation.
- Login rate limiting.
- Helmet security middleware.
- CORS origin restrictions.
- Blockchain private key stored in backend environment variables.

## 11. Conclusion

HoneyChain combines web application technologies, database management, and blockchain integration to provide a honey traceability platform.

The architecture separates frontend presentation, backend processing, database storage, and blockchain verification to make the application easier to maintain and extend.
