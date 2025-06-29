const express = require("express");
const cors = require("cors");
require("dotenv").config(); 
const connectDB = require("./configs/db");
const { clerkMiddleware } = require('@clerk/express');
const { inngest,functions } = require("./inngest/index");
const { serve } = require("inngest/express");
const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())

// Default route
app.get('/', (req, res) => {
    res.send("Server is Live");
});
app.use('/api/inngest',serve({client:inngest,functions}))

// Start the server
app.listen(port, () => {
    console.log(` Server is running on port ${port}`);
});
