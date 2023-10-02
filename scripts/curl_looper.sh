#!/bin/bash

# Loop 20 times
for i in {1..20}; do
  # Generate random data for login and password using openssl
  login=$(openssl rand -hex 16)
  password=$(openssl rand -hex 16)

  # Make the curl request with random values and append a newline
  curl -X POST http://localhost:3000/webhook -H 'Content-Type: application/json' -d "{\"login\":\"${login}\",\"password\":\"${password}\"}" 2>&1 | tee /dev/null &

  # Optional: Sleep for a seconds between requests (adjust as needed)
  sleep 1
done

# Wait for all background curl processes to finish
wait