
const express = require("express")
const cors = require("cors");
const connectDB = require("./configs/db");
require('dotenv').config()
const { clerkMiddleware } = require("@clerk/express");
const { clerkWebhooks } = require("./controllers/clerkWebhooks");

const app = express()
const port = process.env.PORT||5000
 connectDB()

//middeleweres

app.use(cors())


app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf; // ✅ keep as Buffer
    },
  })
);
app.post("/webhooks", clerkWebhooks);
app.use(clerkMiddleware())


app.get('/',(req,res)=>res.send("server is live"))

app.listen(port,()=>console.log(`server listening on port ${port}`))