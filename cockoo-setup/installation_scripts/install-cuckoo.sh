#!/bin/bash
# cuckoo-setup/installation-scripts/install-cuckoo.sh

echo "============================================"
echo "   Cuckoo Sandbox Installation Script"
echo "============================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "Please run as root (sudo)"
   exit 1
fi

# Update system
echo "[1/10] Updating system packages..."
apt update && apt upgrade -y

# Install system dependencies
echo "[2/10] Installing system dependencies..."
apt install -y python3 python3-pip python3-dev python3-venv \
    libffi-dev libssl-dev libjpeg-dev zlib1g-dev \
    libpq-dev libmagic1 mongodb postgresql postgresql-contrib \
    tcpdump apparmor-utils virtualbox virtualbox-ext-pack \
    git vim curl wget

# Install Python packages
echo "[3/10] Installing Python packages..."
pip3 install -U pip setuptools wheel
pip3 install cuckoo

# Create cuckoo user
echo "[4/10] Creating cuckoo user..."
if id "cuckoo" &>/dev/null; then
    echo "User cuckoo already exists"
else
    useradd -m -s /bin/bash cuckoo
    echo "cuckoo:cuckoo" | chpasswd
fi

# Add cuckoo to groups
usermod -a -G vboxusers cuckoo
usermod -a -G pcap cuckoo

# Setup tcpdump permissions
echo "[5/10] Configuring tcpdump..."
groupadd -f pcap
chgrp pcap /usr/sbin/tcpdump
setcap cap_net_raw,cap_net_admin=eip /usr/sbin/tcpdump

# Setup VirtualBox network
echo "[6/10] Setting up VirtualBox network..."
VBoxManage hostonlyif create
VBoxManage hostonlyif ipconfig vboxnet0 --ip 192.168.56.1 --netmask 255.255.255.0

# Initialize Cuckoo
echo "[7/10] Initializing Cuckoo..."
su - cuckoo -c "cuckoo init"

# Setup MongoDB
echo "[8/10] Configuring MongoDB..."
systemctl start mongodb
systemctl enable mongodb

# Setup PostgreSQL
echo "[9/10] Configuring PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql
su - postgres -c "createuser cuckoo"
su - postgres -c "createdb cuckoo -O cuckoo"

# Copy configuration files
echo "[10/10] Copying configuration files..."
cp ../configs/cuckoo.conf /home/cuckoo/.cuckoo/conf/
cp ../configs/virtualbox.conf /home/cuckoo/.cuckoo/conf/
cp ../configs/routing.conf /home/cuckoo/.cuckoo/conf/
chown -R cuckoo:cuckoo /home/cuckoo/.cuckoo

echo ""
echo "============================================"
echo "✓ Cuckoo Sandbox installation complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Create Windows VM using setup-vm.sh"
echo "2. Configure VM in /home/cuckoo/.cuckoo/conf/virtualbox.conf"
echo "3. Take VM snapshot"
echo "4. Start Cuckoo: su - cuckoo -c 'cuckoo'"
echo ""