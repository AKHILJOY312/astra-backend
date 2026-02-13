# Stage 1: Build (compile TS to JS)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev          # Install all deps for build
COPY . .
RUN npm run build                 # Must output to dist/ (e.g. tsc)

# Stage 2: Production runtime (slim)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev             # Only production deps → smaller image
COPY --from=builder /app/dist ./dist
# If you need other files (e.g. prisma schema, views):
# COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]     # Adjust to your actual entry file (check after build)


# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "run", "dev"]
