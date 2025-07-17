const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./configs/db");
const { clerkMiddleware } = require("@clerk/express");

const showRoute = require("./routes/showRoutes");
const bookingRoute = require("./routes/bookingRoutes");
const adminRoute = require("./routes/adminRoutes");
const userRoute = require("./routes/userRoutes");
const { serve } = require("inngest/express");
const { inngest,functions } = require("./inngest/index");
const { stripeWebhooks } = require("./controllers/stripeWebhooks");

const app = express();



// ✅ 2. Global middleware for the rest of your app
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());


//stripe webhook route

app.use('/api/stripe',express.raw({type:"application/json"}),stripeWebhooks)

// ✅ Connect to MongoDB
connectDB();


// ✅ Other API routes
app.get("/", (req, res) => res.send("Server is live"));
app.use('/api/inngest',serve({client:inngest,functions}))


app.use("/api/shows", showRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/admin", adminRoute);
app.use("/api/user", userRoute);

// ✅ Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
