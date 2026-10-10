FROM node:20-bookworm-slim

# Cài đặt ffmpeg cho tính năng phát nhạc
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
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
