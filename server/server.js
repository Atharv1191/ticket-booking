// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./configs/db');
const { clerkMiddleware } = require('@clerk/express');
const { inngest, functions } = require('./inngest/index');
const { serve } = require('inngest/express');

async function startServer() {
  await connectDB();

  const app = express();
  const port = process.env.PORT || 4000;

  app.use(express.json());
  app.use(cors());
  app.use(clerkMiddleware());

  app.get('/', (req, res) => res.send('Server is live'));

  app.use('/api/inngest', serve({ client: inngest, functions }));

  app.listen(port, () => console.log(`🚀 Server listening on http://localhost:${port}`));
}

startServer();
