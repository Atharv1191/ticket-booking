// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./configs/db");
// require("dotenv").config();
// const { clerkWebhooks } = require("./controllers/webhooks");

// const { clerkMiddleware } = require("@clerk/express");
// // const { serve } = require("inngest/express");
// // const { inngest, functions } = require("./inngest");
// const showRoute = require("./routes/showRoutes")
// const bookingRoute = require("./routes/bookingRoutes")
// const adminRoute = require("./routes/adminRoutes")
// const userRoute = require("./routes/userRoutes")
// const app = express();
// const port = process.env.PORT || 5000;

// connectDB();


// // ✅ Clerk needs rawBody for Svix

// app.use(express.json());

// // ✅ Clerk middleware
// app.use(clerkMiddleware());
 
// app.use(cors());

// app.post("/webhooks", clerkWebhooks);

// app.get("/", (req, res) => res.send("Server is live"));

// // // ✅ Correct Inngest v3 usage
// // app.use("/api/inngest", serve({ client: inngest, functions }));

// app.use('/api/shows',showRoute)
// app.use('/api/booking',bookingRoute)
// app.use('/api/admin',adminRoute)
// app.use('/api/user',userRoute)

// app.listen(port, () => console.log(`Server running on port ${port}`));
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

// ✅ Middleware to capture rawBody for Clerk webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; // Required for svix.verify()
  }
}));

// ✅ Enable CORS
app.use(cors());

// ✅ Clerk authentication middleware (optional for protected routes)
app.use(clerkMiddleware());

// ✅ Connect to MongoDB
connectDB();

// ✅ Webhook route for Clerk (must come after rawBody setup)
app.post("/api/webhooks", clerkWebhooks);

// ✅ API routes
app.get("/", (req, res) => res.send("Server is live"));
app.use("/api/shows", showRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/admin", adminRoute);
app.use("/api/user", userRoute);

// ✅ Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
