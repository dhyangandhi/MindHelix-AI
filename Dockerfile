# ========================================================
# MindHelix AI - Multi-Runtime Production Container
# Includes Node.js 20, Python 3, and Shell execution sandbox
# ========================================================

FROM node:20-alpine

# Install Python 3, py3-pip, and bash for the live code execution sandbox
RUN apk add --no-cache python3 py3-pip bash curl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Ensure tmp directories exist
RUN mkdir -p tmp_code_runs www

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]

