
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import hiveRoutes from "./routes/hiveRoutes.js";
import honeyBatchRoutes from "./routes/honeyBatchRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import helmet from "helmet";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Trust the single reverse proxy in front of the Render service.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const PORT = process.env.PORT || 5000;

app.use(helmet());

// Validate critical production environment variables.
function validateEnvironment() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "Production requires a JWT_SECRET of at least 32 bytes."
    );
  }
}

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.CLIENT_URL].filter(Boolean)
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (Postman, server-to-server).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/hives", hiveRoutes);
app.use("/api/batches", honeyBatchRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HoneyChain API is running",
    version: "1.0.0",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  return res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    service: "HoneyChain API",
    status: isConnected ? "healthy" : "unhealthy",
    database: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Handle unknown routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed.",
    });
  }

  // Handle invalid JSON request bodies
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  console.error("API Error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});


async function startServer() {
  try {
    validateEnvironment();

    await connectDB();

    app.listen(PORT, () => {
      console.log(`HoneyChain API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup aborted:", error.message);
    process.exit(1);
  }
}

startServer();
