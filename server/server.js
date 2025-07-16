const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./configs/db");
const { clerkMiddleware } = require("@clerk/express");
const { clerkWebhooks } = require("./api/webhooks");

const showRoute = require("./routes/showRoutes");
const bookingRoute = require("./routes/bookingRoutes");
const adminRoute = require("./routes/adminRoutes");
const userRoute = require("./routes/userRoutes");

const app = express();

// ✅ 1. Use raw body ONLY for webhooks BEFORE express.json()
app.use("/api/webhooks", express.raw({ type: "application/json" }));

// ✅ 2. Global middleware for the rest of your app
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// ✅ Connect to MongoDB
connectDB();

// ✅ 3. Define the webhook route AFTER raw body middleware
app.post("/api/webhooks", clerkWebhooks);

// ✅ Other API routes
app.get("/", (req, res) => res.send("Server is live"));
app.use("/api/shows", showRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/admin", adminRoute);
app.use("/api/user", userRoute);

// ✅ Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
