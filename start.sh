#!/bin/sh

# Start backend in background
npm run start:prod &

# Start frontend
cd frontend && npm start