FROM node:20-bookworm-slim
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
