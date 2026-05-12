# Stage 1: compile TypeScript
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Stage 2: runtime with yt-dlp + ffmpeg
FROM node:20-slim
RUN apt-get update && apt-get install -y \
    python3 python3-venv ffmpeg \
    && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/venv && /opt/venv/bin/pip install yt-dlp
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
RUN mkdir -p temp

EXPOSE 3000
CMD ["node", "dist/index.js"]
