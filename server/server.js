const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./configs/db");
const { clerkMiddleware } = require("@clerk/express");
const { inngest, functions } = require("./inngest/index");
const { serve } = require("inngest/express");

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    const app = express();
    const port = process.env.PORT || 5000;

    // Middleware
    app.use(express.json());
    app.use(cors());
    app.use(clerkMiddleware());

    // Routes
    app.get("/", (req, res) => {
      res.send("Server is Live");
    });

    // Inngest webhook route
    app.use("/api/inngest", serve({ client: inngest, functions }));

    // Start the server
    app.listen(port, () => {
      console.log(` Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
