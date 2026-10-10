FROM node:20-bookworm-slim

# Cài đặt ffmpeg, yt-dlp và build tools cho codec âm thanh Opus gốc siêu mượt
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    build-essential \
    python3 \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies nhanh gọn không cần compile C++
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn
COPY . .

# Tạo thư mục data
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/database.json

EXPOSE 3000

# Khởi chạy bot
CMD ["node", "src/index.js"]
