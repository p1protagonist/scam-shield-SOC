# Multi-runtime Dockerfile for Railway, Render, Fly.io, and Cloud Run
FROM node:20-bookworm-slim

# Debian 12 marks system Python as externally managed (PEP 668); allow pip installs into it
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Install Python and audio C-libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    libsndfile1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt || pip3 install --no-cache-dir fastapi uvicorn websockets pydantic numpy requests

# Copy Node dependency manifests and npm configuration
COPY package*.json .npmrc* ./

# Install Node dependencies with legacy peer resolution to prevent upstream conflict
RUN npm install --legacy-peer-deps

# Copy application source code
COPY . ./

# Build Vite frontend and compile server.js
RUN npm run build

# Expose default port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start command
CMD ["node", "server.js"]
