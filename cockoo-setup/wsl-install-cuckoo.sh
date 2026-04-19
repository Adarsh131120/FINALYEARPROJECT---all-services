#!/bin/bash
# WSL Ubuntu Cuckoo Installation Script

set -e

echo "============================================"
echo "   Cuckoo Sandbox Setup for WSL"
echo "============================================"

# Update system
echo "[1/8] Updating system..."
sudo apt update
sudo apt upgrade -y

# Install dependencies
echo "[2/8] Installing dependencies..."
sudo apt install -y python3 python3-pip python3-venv \
    libffi-dev libssl-dev libjpeg-dev zlib1g-dev \
    libpq-dev libmagic1 git vim curl wget \
    tcpdump net-tools

# Create Python virtual environment
echo "[3/8] Creating Python virtual environment..."
cd ~
python3 -m venv cuckoo-venv
source cuckoo-venv/bin/activate

# Install Cuckoo
echo "[4/8] Installing Cuckoo..."
pip install -U pip setuptools
pip install cuckoo

# Initialize Cuckoo
echo "[5/8] Initializing Cuckoo..."
cuckoo init
cuckoo community

# Setup tcpdump
echo "[6/8] Configuring tcpdump..."
sudo groupadd -f pcap
sudo usermod -a -G pcap $USER
sudo chgrp pcap /usr/sbin/tcpdump
sudo setcap cap_net_raw,cap_net_admin=eip /usr/sbin/tcpdump

# Configure Cuckoo for localhost (no VM initially)
echo "[7/8] Configuring Cuckoo..."
cat > ~/.cuckoo/conf/cuckoo.conf << 'EOF'
[cuckoo]
version_check = no
delete_original = no
delete_bin_copy = no
machinery = none

[resultserver]
ip = 127.0.0.1
port = 2042

[processing]
analysis_size_limit = 104857600

[database]
connection = sqlite:///cuckoo.db
EOF

# Create start script
echo "[8/8] Creating start scripts..."
cat > ~/start-cuckoo.sh << 'EOF'
#!/bin/bash
source ~/cuckoo-venv/bin/activate
cuckoo -d
EOF
chmod +x ~/start-cuckoo.sh

cat > ~/start-cuckoo-web.sh << 'EOF'
#!/bin/bash
source ~/cuckoo-venv/bin/activate
cuckoo web --host 0.0.0.0 --port 8080
EOF
chmod +x ~/start-cuckoo-web.sh

echo ""
echo "============================================"
echo "✓ Cuckoo installation complete!"
echo "============================================"
echo ""
echo "To start Cuckoo:"
echo "  wsl -d Ubuntu-22.04 -- ~/start-cuckoo.sh"
echo ""
echo "To start web interface:"
echo "  wsl -d Ubuntu-22.04 -- ~/start-cuckoo-web.sh"
echo ""
echo "Cuckoo directory: ~/.cuckoo"
echo ""1

