FROM node:20-bookworm-slim

# Cài đặt ffmpeg cho phát nhạc và build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies (sử dụng npm install để tự động build native addon tương thích Linux)
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn
COPY . .

# Tạo thư mục data
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/database.sqlite

EXPOSE 3000

# Khởi chạy bot
CMD ["node", "src/index.js"]
