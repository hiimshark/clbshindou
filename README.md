# 🤖 Discord Bot Đa Chức Năng 24/24 trên Railway

Bot Discord hiện đại, tối ưu hóa hiệu năng cao, cấu trúc **Clean Code** dạng module, hỗ trợ treo **24/24 trên Railway**.
Phát triển bằng **Node.js (Discord.js v14)** kết hợp cơ sở dữ liệu **SQLite (better-sqlite3)** và công cụ phát nhạc **DisTube v5**.

---

## 🌟 10 Tính Năng Nổi Bật

| # | Tính Năng | Lệnh / Tương Tác | Mô Tả |
|---|---|---|---|
| 1 | **Welcome & Goodbye** | `/setwelcome`, `/setgoodbye` | Gửi Embed chào mừng và tạm biệt tùy biến kèm Avatar, thứ tự thành viên |
| 2 | **Cấp Role & Auto-Role** | `/role add/remove`, `/autorole set/remove` | Cấp/thu hồi role an toàn (phân cấp quyền) & tự cấp role khi vào server |
| 3 | **Phát Nhạc Đỉnh Cao** | `/play`, `/skip`, `/stop`, `/pause`, `/resume`, `/queue`, `/nowplaying`, `/volume` | Hỗ trợ YouTube, Spotify, SoundCloud; giao diện nút bấm tương tác trực tiếp |
| 4 | **Minigame Nối Từ VN** | `/noitu set`, `/noitu stats`, `/noitu reset` | Nối từ tiếng Việt chuẩn (>50.000 từ), chống tự nối, chống lặp, tính streak kỷ lục |
| 5 | **Check Avatar & User Info** | `/avatar`, `/userinfo` | Xem và tải ảnh đại diện HD (Server/Global), tra cứu ngày tạo, vai trò |
| 6 | **Xóa Tin Nhắn** | `/clear` | Dọn dẹp nhanh 1-100 tin nhắn, hỗ trợ lọc theo người dùng, vượt qua giới hạn 14 ngày |
| 7 | **Cấm Chat (Timeout)** | `/mute`, `/unmute` | Cấm chat bằng Discord Native API từ 1m đến 28d, tự động gửi DM báo lý do |
| 8 | **Xử Phạt (Ban & Kick)** | `/ban`, `/kick` | Cấm vĩnh viễn/trục xuất, tùy chọn xóa tin nhắn cũ, gửi DM thông báo |
| 9 | **Thông Báo (Announce)** | `/announce` | Gửi thông báo trang trọng dạng Embed với màu sắc viền, ảnh minh họa, tag `@everyone` |
| 10 | **Hệ Thống Ticket** | `/ticket setup`, `/ticket close` | Bảng bấm nút `[📩 Mở Ticket]` -> Tạo kênh riêng tư -> Điều khiển đóng, xuất transcript HTML |

---

## 🛠️ Yêu Cầu & Chuẩn Bị

### 1. Bật Privileged Gateway Intents trên Discord Portal
Truy cập [Discord Developer Portal](https://discord.com/developers/applications):
1. Chọn ứng dụng Bot của bạn -> Vào mục **Bot**.
2. Cuộn xuống phần **Privileged Gateway Intents** và BẬT:
   - ✅ **PRESENCE INTENT**
   - ✅ **SERVER MEMBERS INTENT** *(Bắt buộc cho Welcome/Goodbye/AutoRole)*
   - ✅ **MESSAGE CONTENT INTENT** *(Bắt buộc cho Minigame Nối từ)*
3. Lấy **Bot Token** (Nút *Reset Token*) và **Client ID** (mục *General Information > Application ID*).

---

## 🚀 Chạy Thử Nghiệm Trên Máy Cục Bộ (Local)

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình file `.env`:**
   Tạo file `.env` từ file mẫu `.env.example`:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   PORT=3000
   ```

3. **Khởi chạy bot:**
   ```bash
   npm start
   ```

---

## ☁️ Hướng Dẫn Treo 24/24 Trên Railway

### Bước 1: Đẩy mã nguồn lên GitHub
1. Tạo một repository mới trên GitHub (ví dụ: `my-discord-bot`).
2. Mở terminal tại thư mục này và chạy:
   ```bash
   git init
   git add .
   git commit -m "Initial commit Discord Bot"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

### Bước 2: Tạo Project trên Railway
1. Đăng nhập [Railway.app](https://railway.app/).
2. Nhấn **New Project** -> Chọn **Deploy from GitHub repo**.
3. Chọn kho chứa GitHub bạn vừa tạo. Railway sẽ tự động nhận diện `Dockerfile`.

### Bước 3: Cấu hình Biến Môi Trường (Variables)
Trong trang Service trên Railway, chuyển sang tab **Variables** và thêm các biến:
- `DISCORD_TOKEN`: Token bot của bạn.
- `CLIENT_ID`: Application ID của bot.
- `PORT`: `3000` (hoặc để mặc định Railway tự cấp `$PORT`).
- `DATABASE_PATH`: `/app/data/database.sqlite`.

### Bước 4: Gắn Persistent Volume (Để không mất dữ liệu SQLite)
1. Trong màn hình Architecture của Railway, bấm chuột phải hoặc nhấn **Add Service / Volume**.
2. Thêm một **Volume** mới và gắn (Mount) vào đường dẫn:
   ```
   /app/data
   ```
3. Khởi động lại service (Redeploy). Giờ đây dữ liệu cấu hình, điểm nối từ và vé ticket sẽ được lưu trữ vĩnh viễn kể cả khi bot cập nhật phiên bản mới!

---

## 📁 Cấu Trúc Mã Nguồn (Clean Architecture)

```
discord-bot-railway/
├── Dockerfile                  # Container build tối ưu (Node 20 + ffmpeg)
├── railway.json                # Quy chuẩn triển khai Railway
├── package.json                # Cấu hình dự án & scripts
├── src/
│   ├── index.js                # Điểm khởi chạy & Mini HTTP Healthcheck Server
│   ├── client.js               # Khởi tạo Discord Client (Intents & Partials)
│   ├── config.js               # Quản lý & xác thực biến môi trường
│   ├── database/
│   │   ├── db.js               # Khởi tạo SQLite (WAL mode)
│   │   └── guildService.js     # Thao tác dữ liệu Server, Ticket, Nối từ
│   ├── handlers/
│   │   ├── commandHandler.js   # Tự động nạp Slash Commands
│   │   ├── eventHandler.js     # Tự động nạp Events
│   │   ├── componentHandler.js # Điều phối Buttons & Modals
│   │   └── musicHandler.js     # DisTube Audio Engine & Buttons
│   ├── commands/
│   │   ├── general/            # avatar, userinfo, ping
│   │   ├── moderation/         # clear, mute, unmute, ban, kick, announce
│   │   ├── admin/              # role, autorole, setwelcome, setgoodbye
│   │   ├── music/              # play, skip, stop, pause, resume, queue, nowplaying, volume
│   │   ├── ticket/             # ticket
│   │   └── minigame/           # noitu
│   ├── events/
│   │   ├── client/             # ready, interactionCreate
│   │   ├── guild/              # guildMemberAdd, guildMemberRemove
│   │   └── message/            # messageCreate (Nối từ engine)
│   ├── components/
│   │   ├── buttons/            # musicButtons, ticketButtons
│   │   └── modals/             # ticketModal
│   ├── utils/
│   │   ├── logger.js           # Ghi log màu trực quan
│   │   ├── embedBuilder.js     # Chuẩn hóa giao diện Embed
│   │   ├── vietnameseDict.js   # Thuật toán tra cứu từ điển tiếng Việt
│   │   └── transcript.js       # Xuất file lịch sử tin nhắn ticket
│   └── data/
│       └── vietnamese_words.json # Bộ dữ liệu 50.000+ từ vựng tiếng Việt
```

---

## 🛡️ Giấy Phép & Tác Quyền
Được phát triển với tiêu chuẩn **Clean Code** và kiến trúc Module độc lập, dễ dàng mở rộng và bảo trì.
Mã nguồn phát hành theo giấy phép **MIT**.
