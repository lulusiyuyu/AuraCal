#!/usr/bin/env bash
# ============================================================
# AuraCal VPS Server Setup Script
# Tested on: Ubuntu 22.04+ / Debian 12+
# Target: 2C2G VPS
# ============================================================
set -e

echo "🌟 AuraCal Server Setup Starting..."

# ── 1. System Updates ────────────────────────────────────────
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# ── 2. Install Dependencies ──────────────────────────────────
echo "📦 Installing Nginx, Redis, Python 3.12+, Node.js..."
apt install -y nginx redis-server python3 python3-pip python3-venv \
               nodejs npm curl git

# ── 3. Setup Swap (2GB) — essential for 2G RAM ──────────────
if [ ! -f /swapfile ]; then
    echo "💾 Creating 2GB Swap..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "✅ Swap enabled"
else
    echo "✅ Swap already exists"
fi

# ── 4. Configure Redis (50MB memory limit) ───────────────────
echo "⚡ Configuring Redis..."
cat > /etc/redis/redis.conf.d/auracal.conf << 'EOF'
maxmemory 50mb
maxmemory-policy allkeys-lru
EOF
systemctl restart redis-server

# ── 5. Install uv (Python package manager) ──────────────────
echo "📦 Installing uv..."
pip install uv || curl -LsSf https://astral.sh/uv/install.sh | sh

# ── 6. Clone / Copy Project ──────────────────────────────────
PROJECT_DIR="/opt/auracal"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📂 Please clone or copy your project to $PROJECT_DIR"
    echo "   Example: git clone https://github.com/YOUR_USER/AuraCal.git $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
fi

# ── 7. Backend Setup ─────────────────────────────────────────
echo "🐍 Setting up backend..."
if [ -d "$PROJECT_DIR/backend" ]; then
    cd "$PROJECT_DIR/backend"
    uv sync
    echo "✅ Backend dependencies installed"

    # Reminder to configure .env
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || true
        echo "⚠️  Please edit $PROJECT_DIR/backend/.env with your credentials"
    fi
fi

# ── 8. Frontend Build ────────────────────────────────────────
echo "🎨 Building frontend..."
if [ -d "$PROJECT_DIR/frontend" ]; then
    cd "$PROJECT_DIR/frontend"
    npm install
    npm run build

    # Deploy to Nginx web root
    rm -rf /var/www/auracal
    cp -r dist /var/www/auracal
    echo "✅ Frontend built and deployed to /var/www/auracal"
fi

# ── 9. Install Nginx Config ──────────────────────────────────
echo "🌐 Configuring Nginx..."
if [ -f "$PROJECT_DIR/deploy/nginx.conf" ]; then
    cp "$PROJECT_DIR/deploy/nginx.conf" /etc/nginx/sites-available/auracal
    ln -sf /etc/nginx/sites-available/auracal /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl restart nginx
    echo "✅ Nginx configured"
fi

# ── 10. Install Systemd Service ──────────────────────────────
echo "⚙️ Installing systemd service..."
if [ -f "$PROJECT_DIR/deploy/auracal.service" ]; then
    cp "$PROJECT_DIR/deploy/auracal.service" /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable auracal
    systemctl start auracal
    echo "✅ AuraCal service started"
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo "🌟 AuraCal Setup Complete!"
echo "============================================================"
echo ""
echo "📋 Next steps:"
echo "  1. Edit /opt/auracal/backend/.env with your credentials"
echo "  2. Edit /etc/nginx/sites-available/auracal (replace 154.193.217.104)"
echo "  3. Restart services:"
echo "     systemctl restart auracal"
echo "     systemctl restart nginx"
echo ""
echo "📊 Memory usage:"
free -h
echo ""
echo "🔗 Your AuraCal should be live at: http://154.193.217.104"
