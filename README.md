# Webhook Logger

Webhook Logger is a web application that listens for incoming webhook events and displays them in real-time. It allows you to monitor and log webhook events, making it easier to track and analyze incoming data.

## Features

- Real-time display of incoming webhook events.
- Search functionality to filter and find specific events.
- Clear button to reset the search and view all events.
- Persistent storage using local storage to keep logs between sessions.
- Modern and responsive user interface.
- Pagination of 10 events shown per page
- Event JSON collapser/expander

## Getting Started

To get started with the Webhook Logger, follow these steps:

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/webhook-logger.git
   
2. Open the project folder and install dependencies:

   ```bash
   cd webhook-logger && npm install

3. Start the server:

   ```bash
   npm start

4. Send POST request like:

   ```bash
   curl -X POST http://localhost:3000/webhook -H 'Content-Type: application/json' -d '{"login":"test_user","password":"test_password"}'

5. You can use the bash script provided in the /scripts folder to loop the CURL request (default iterations = 20)

   ```bash
   chmod +x scripts/curl_looper.sh && ./scripts/curl_looper.sh




