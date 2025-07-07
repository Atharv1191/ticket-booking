const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/db");
require("dotenv").config();
const { clerkWebhooks } = require("./controllers/webhooks");

const { clerkMiddleware } = require("@clerk/express");
// const { serve } = require("inngest/express");
// const { inngest, functions } = require("./inngest");

const app = express();
const port = process.env.PORT || 5000;

connectDB();


// ✅ Clerk needs rawBody for Svix

app.use(express.json());

// ✅ Clerk middleware
app.use(clerkMiddleware());
app.use(cors());
app.use(clerkMiddleware());
app.post("/webhooks", clerkWebhooks);

app.get("/", (req, res) => res.send("Server is live"));

// // ✅ Correct Inngest v3 usage
// app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(port, () => console.log(`Server running on port ${port}`));
