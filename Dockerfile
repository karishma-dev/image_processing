# ----- Build Stage ----
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
COPY ./prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

RUN ls /app

# ------ Production Stage ------
FROM node:22-slim AS prod

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated/prisma ./generated

RUN apt-get update -y && apt-get install -y openssl
RUN npm install --production

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', res => { if(res.statusCode !== 200) process.exit(1) })"

EXPOSE 3000

CMD [ "node", "dist/app.js" ]