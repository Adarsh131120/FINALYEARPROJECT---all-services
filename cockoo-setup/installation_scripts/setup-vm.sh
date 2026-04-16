#!/bin/bash
# cuckoo-setup/installation-scripts/setup-vm.sh

echo "============================================"
echo "   Cuckoo VM Setup Script"
echo "============================================"

VM_NAME="CuckooVM1"
VM_MEMORY=2048
VM_CPUS=2
VM_DISK_SIZE=40000
ISO_PATH="$1"

if [ -z "$ISO_PATH" ]; then
    echo "Usage: $0 <path-to-windows-iso>"
    exit 1
fi

if [ ! -f "$ISO_PATH" ]; then
    echo "Error: ISO file not found: $ISO_PATH"
    exit 1
fi

echo "[1/5] Creating VM..."
VBoxManage createvm --name "$VM_NAME" --ostype Windows10_64 --register

echo "[2/5] Configuring VM settings..."
VBoxManage modifyvm "$VM_NAME" \
    --memory $VM_MEMORY \
    --cpus $VM_CPUS \
    --vram 128 \
    --nic1 hostonly \
    --hostonlyadapter1 vboxnet0 \
    --audio none \
    --usb off \
    --boot1 dvd \
    --boot2 disk

echo "[3/5] Creating virtual disk..."
VBoxManage createhd \
    --filename ~/VirtualBox\ VMs/$VM_NAME/$VM_NAME.vdi \
    --size $VM_DISK_SIZE

echo "[4/5] Attaching storage..."
VBoxManage storagectl "$VM_NAME" --name "SATA Controller" --add sata
VBoxManage storageattach "$VM_NAME" \
    --storagectl "SATA Controller" \
    --port 0 \
    --device 0 \
    --type hdd \
    --medium ~/VirtualBox\ VMs/$VM_NAME/$VM_NAME.vdi

VBoxManage storagectl "$VM_NAME" --name "IDE Controller" --add ide
VBoxManage storageattach "$VM_NAME" \
    --storagectl "IDE Controller" \
    --port 0 \
    --device 0 \
    --type dvddrive \
    --medium "$ISO_PATH"

echo "[5/5] Starting VM for installation..."
VBoxManage startvm "$VM_NAME"

echo ""
echo "============================================"
echo "✓ VM created and started!"
echo "============================================"
echo ""
echo "Manual steps required:"
echo "1. Install Windows in the VM"
echo "2. Configure network: IP=192.168.56.101, Gateway=192.168.56.1"
echo "3. Disable Windows Defender, Firewall, UAC"
echo "4. Install Python 2.7"
echo "5. Copy agent.py to C:\agent.py"
echo "6. Create startup script for agent.py"
echo "7. Take snapshot: VBoxManage snapshot $VM_NAME take clean_snapshot --pause"
echo ""