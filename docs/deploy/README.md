# Deploy backend-hto bằng Docker Compose và GitHub Actions

Tài liệu này dùng cho repo `backend-hto` với NestJS backend và MongoDB.

## 1. Thành phần deploy

File chính:

```text
Dockerfile.backend-hto        Build image cho app
docker-compose.cicd.yml      Chạy container app, optional mongo/redis
.env.cicd.example            Mẫu biến môi trường
.github/workflows/docker-deploy.yml
deploy/README.md             Tài liệu deploy
```

Compose có các service:

```text
app      Backend NestJS
mongo    MongoDB local, chỉ chạy khi bật COMPOSE_PROFILES=mongo
redis    Redis local, chỉ chạy khi bật COMPOSE_PROFILES=redis
```

Nếu dùng MongoDB Atlas thì không cần chạy service `mongo`.

## 2. Chạy local trên máy dev

Từ thư mục gốc repo:

```bash
cp .env.cicd.example .env
```

Sửa `.env` và set MongoDB:

```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/hito_crm?appName=HTO-internal"
DATABASE_NAME=hito_crm
APP_PORT=8080
CONTAINER_PORT=8080
NODE_ENV=production
```

Build và chạy:

```bash
docker compose -f docker-compose.cicd.yml up -d --build
```

Xem log:

```bash
docker compose -f docker-compose.cicd.yml logs -f app
```

Mở app:

```text
http://localhost:8080
```

Dừng container:

```bash
docker compose -f docker-compose.cicd.yml down
```

## 3. MongoDB Atlas

Khuyến nghị production dùng MongoDB Atlas.

Trong file `.env` trên máy dev hoặc server:

```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/hito_crm?appName=HTO-internal"
```

Chạy app:

```bash
docker compose -f docker-compose.cicd.yml up -d --build
```

Không bật `COMPOSE_PROFILES=mongo` khi dùng Atlas.

Lưu ý bảo mật:

```text
.env không được commit lên git
Không paste DATABASE_URL thật vào README, issue, commit, hoặc log public
Nếu lộ password MongoDB Atlas, đổi password user đó ngay
```

## 4. MongoDB local bằng Docker

Chỉ dùng cách này khi muốn chạy MongoDB ngay trong Docker Compose.

Trong `.env`:

```env
COMPOSE_PROFILES=mongo
MONGO_INITDB_ROOT_USERNAME=backend_hto
MONGO_INITDB_ROOT_PASSWORD=change_me
MONGO_INITDB_DATABASE=hito_crm
MONGO_PORT=27017
DATABASE_URL="mongodb://backend_hto:change_me@mongo:27017/hito_crm?authSource=admin"
DATABASE_NAME=hito_crm
```

Chạy:

```bash
COMPOSE_PROFILES=mongo docker compose -f docker-compose.cicd.yml up -d --build
```

Quan trọng: trong container app phải dùng host `mongo`, không dùng `localhost`.

Đúng:

```env
DATABASE_URL="mongodb://backend_hto:change_me@mongo:27017/hito_crm?authSource=admin"
```

Sai khi chạy trong Docker:

```env
DATABASE_URL="mongodb://localhost:27017/hito_crm"
```

Vì `localhost` bên trong container app là chính container app, không phải container MongoDB.

## 5. Redis optional

Nếu app cần Redis:

```bash
COMPOSE_PROFILES=redis docker compose -f docker-compose.cicd.yml up -d --build
```

Nếu cần cả Mongo local và Redis:

```bash
COMPOSE_PROFILES=mongo,redis docker compose -f docker-compose.cicd.yml up -d --build
```

## 6. Chuẩn bị server production

Ví dụ server Ubuntu.

Cài Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Tạo thư mục deploy:

```bash
sudo mkdir -p /opt/backend-hto
sudo chown -R $USER:$USER /opt/backend-hto
cd /opt/backend-hto
```

Tạo file `.env` trên server:

```bash
nano .env
```

Nội dung tối thiểu:

```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/hito_crm?appName=HTO-internal"
DATABASE_NAME=hito_crm
APP_PORT=8080
CONTAINER_PORT=8080
NODE_ENV=production
TZ=Asia/Ho_Chi_Minh
```

Nếu app có thêm biến môi trường khác, thêm vào file `.env` này.

## 7. GitHub Actions CI/CD

Workflow nằm tại:

```text
.github/workflows/docker-deploy.yml
```

Khi push vào `main` hoặc `master`, workflow sẽ:

```text
1. Build Docker image
2. Push image lên GitHub Container Registry, ghcr.io
3. SSH vào server
4. Upload docker-compose.yml vào DEPLOY_PATH
5. Pull image mới
6. docker compose up -d --remove-orphans
```

Image được push theo dạng:

```text
ghcr.io/<owner>/<repo>:<commit-sha>
ghcr.io/<owner>/<repo>:latest
```

## 8. GitHub Secrets cần cấu hình

Vào GitHub repo:

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

Thêm các secret bắt buộc:

```text
DEPLOY_HOST      IP hoặc domain server, ví dụ 103.xxx.xxx.xxx
DEPLOY_USER      SSH user trên server, ví dụ ubuntu hoặc deploy
DEPLOY_SSH_KEY   Private SSH key dùng để login server
DEPLOY_PATH      Thư mục deploy trên server, ví dụ /opt/backend-hto
```

Ví dụ:

```text
DEPLOY_HOST=103.10.20.30
DEPLOY_USER=ubuntu
DEPLOY_PATH=/opt/backend-hto
```

`DEPLOY_SSH_KEY` là nội dung private key, ví dụ file local:

```bash
cat ~/.ssh/id_ed25519
```

Copy toàn bộ nội dung bắt đầu bằng:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
```

và kết thúc bằng:

```text
-----END OPENSSH PRIVATE KEY-----
```

## 9. GHCR private package

Nếu GitHub Container Registry package để private, server cần login GHCR.

Thêm secrets optional:

```text
GHCR_USERNAME    GitHub username hoặc bot user
GHCR_PAT         Token có quyền read:packages
```

Tạo token tại:

```text
GitHub -> Settings -> Developer settings -> Personal access tokens
```

Quyền cần có:

```text
read:packages
```

Nếu package public thì có thể không cần `GHCR_USERNAME` và `GHCR_PAT`.

## 10. GitHub Variables optional

Vào:

```text
Settings -> Secrets and variables -> Actions -> Variables
```

Có thể thêm:

```text
APP_PORT          Port public trên server, mặc định 8080
CONTAINER_PORT    Port app bên trong container, mặc định 8080
COMPOSE_PROFILES  mongo,redis nếu muốn bật service optional
```

Với MongoDB Atlas, để trống `COMPOSE_PROFILES` hoặc chỉ set `redis` nếu cần Redis.

## 11. Deploy thủ công trên server

Nếu không dùng GitHub Actions, có thể deploy thủ công:

```bash
cd /opt/backend-hto
docker compose pull app
docker compose up -d --remove-orphans
docker compose logs -f app
```

Nếu build trực tiếp từ source trên server:

```bash
git pull
docker compose -f docker-compose.cicd.yml up -d --build
```

## 12. Lệnh kiểm tra nhanh

Xem container:

```bash
docker ps
```

Xem log app:

```bash
docker compose -f docker-compose.cicd.yml logs -f app
```

Kiểm tra compose config:

```bash
docker compose -f docker-compose.cicd.yml config
```

Kiểm tra health endpoint:

```bash
curl http://localhost:8080/api/v1/health
```

Restart app:

```bash
docker compose -f docker-compose.cicd.yml restart app
```

Xóa container nhưng giữ volume:

```bash
docker compose -f docker-compose.cicd.yml down
```

Xóa cả volume Mongo/Redis local:

```bash
docker compose -f docker-compose.cicd.yml down -v
```

## 13. Lỗi thường gặp

Build lỗi TypeScript:

```text
error TS2305 hoặc nest build failed
```

Fix code TypeScript trước, sau đó build lại:

```bash
docker compose -f docker-compose.cicd.yml up -d --build
```

App không connect được MongoDB Atlas:

```text
Kiểm tra DATABASE_URL đúng chưa
Kiểm tra password có ký tự đặc biệt đã encode chưa
Kiểm tra Atlas Network Access đã allow IP server chưa
```

App không connect được Mongo local:

```text
DATABASE_URL phải dùng host mongo
COMPOSE_PROFILES phải có mongo
Không dùng localhost trong DATABASE_URL khi app chạy trong Docker
```

Port bị chiếm:

```bash
APP_PORT=8081 docker compose -f docker-compose.cicd.yml up -d
```

GitHub Actions build được nhưng deploy bị skip:

```text
Thiếu một trong các secrets:
DEPLOY_HOST
DEPLOY_USER
DEPLOY_SSH_KEY
DEPLOY_PATH
```

Server pull image bị denied:

```text
Package GHCR đang private
Thêm GHCR_USERNAME và GHCR_PAT
Hoặc chuyển package sang public
```

## 14. Checklist production

Trước khi deploy production:

```text
[ ] .env không nằm trong git
[ ] DATABASE_URL MongoDB Atlas đúng database hito_crm
[ ] Atlas Network Access allow IP server
[ ] GitHub Secrets đã có DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY, DEPLOY_PATH
[ ] Server đã cài Docker và docker compose plugin
[ ] DEPLOY_PATH trên server có file .env
[ ] Port APP_PORT đã mở firewall/security group
[ ] Chạy docker compose logs -f app sau deploy để kiểm tra lỗi runtime
```
