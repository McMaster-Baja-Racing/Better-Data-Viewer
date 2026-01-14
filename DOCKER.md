# Better Data Viewer - Docker Deployment

## 🚀 Quick Start

```bash
docker run -d \
  --name better-data-viewer \
  -p 8080:8080 \
  -v ./uploads:/deployments/uploads \
  --restart unless-stopped \
  ghcr.io/mcmaster-baja-racing/better-data-viewer:latest
```

**Access your app at:** `http://localhost:8080`

## ⚙️ Configuration

### 📂 Change Data Storage Location

```bash
docker run -d \
  --name better-data-viewer \
  -p 8080:8080 \
  -v /my/custom/path:/deployments/uploads \  # 👈 Change this path
  --restart unless-stopped \
  ghcr.io/mcmaster-baja-racing/better-data-viewer:latest
```

### 🔌 Change Exposed Port

```bash
docker run -d \
  --name better-data-viewer \
  -p 3000:8080 \  # 👈 Change 3000 to your desired host port
  -v ./uploads:/deployments/uploads \
  --restart unless-stopped \
  ghcr.io/mcmaster-baja-racing/better-data-viewer:latest
```

Access at: `http://localhost:3000`

## 🔄 Updating to Latest Version

```bash
docker stop better-data-viewer
docker rm better-data-viewer
docker pull ghcr.io/mcmaster-baja-racing/better-data-viewer:latest
docker run -d --name better-data-viewer -p 8080:8080 -v ./uploads:/deployments/uploads --restart unless-stopped ghcr.io/mcmaster-baja-racing/better-data-viewer:latest
```

## 📊 Monitoring

```bash
# View logs
docker logs -f better-data-viewer

# Check status
docker ps

# Restart
docker restart better-data-viewer
```

## 🛑 Stopping

```bash
docker stop better-data-viewer
docker rm better-data-viewer
```

## 🐳 Using Docker Compose (Optional)

If you prefer docker-compose, download [docker-compose.yml](docker-compose.yml) and run:

```bash
docker-compose up -d      # Start
docker-compose pull       # Update
docker-compose down       # Stop
docker-compose logs -f    # View logs
```

## 📝 Notes

- Container runs both frontend and backend on port 8080
- Data persists in the mounted volume (./uploads by default)
- Image is hosted on GitHub Container Registry (ghcr.io)
- If the package is public, no authentication needed to pull
