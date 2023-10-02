// webhook-server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store received webhook logs in an array
const webhookLogs = [];

// Parse JSON payloads
app.use(express.json()); 

// Handle incoming webhook data here
app.post('/webhook', (req, res) => {

  // Add the webhook data to webhookLogs
  const webhookData = req.body; // Assuming webhook data is in JSON format
  webhookLogs.push(webhookData);

  // Emit the webhook data to connected clients
  io.emit('webhook', webhookData);

  // Send a response to the webhook source (if required)
  res.status(200).send('Webhook received successfully');
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server listening on specified port
server.listen(3000, () => {
  console.log('Webhook server is running on port 3000');
});
