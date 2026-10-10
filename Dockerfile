FROM node:20-bookworm-slim

# Cài đặt ffmpeg cho phát nhạc và build tools cho native SQLite
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies môi trường production
RUN npm ci --omit=dev

# Copy toàn bộ mã nguồn
COPY . .

# Tạo thư mục data cho SQLite (gắn Railway Volume tại đây)
RUN mkdir -p /app/data

# Thiết lập biến môi trường mặc định
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/database.sqlite

EXPOSE 3000

# Khởi chạy bot
CMD ["node", "src/index.js"]
