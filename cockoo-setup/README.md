# cuckoo-setup/README.md

# Cuckoo Sandbox Setup Guide

## Quick Start

```bash
cd cuckoo-setup/installation-scripts
sudo ./install-cuckoo.sh
sudo ./setup-vm.sh /path/to/windows.iso
```

## Manual Configuration

### 1. Install Windows in VM
- Boot the created VM
- Install Windows 7/10
- Complete Windows setup

### 2. Configure Windows VM

Network Settings:

IP: 192.168.56.101
Subnet: 255.255.255.0
Gateway: 192.168.56.1
DNS: 8.8.8.8


### 3. Disable Security Features
- Windows Defender
- Windows Firewall
- User Account Control (UAC)
- Windows Updates

### 4. Install Cuckoo Agent

Download agent.py to Windows VM:

Create startup batch file:
```batch
@echo off
C:\Python27\python.exe C:\agent.py
```

Add to Windows startup folder.

### 5. Take Snapshot
```bash
VBoxManage snapshot CuckooVM1 take clean_snapshot --pause
```

### 6. Start Cuckoo
```bash
su - cuckoo
cuckoo
```

## Troubleshooting

### VM not responding
```bash
VBoxManage list runningvms
VBoxManage controlvm CuckooVM1 poweroff
VBoxManage snapshot CuckooVM1 restore clean_snapshot
```

### Network issues
```bash
VBoxManage list hostonlyifs
VBoxManage hostonlyif ipconfig vboxnet0 --ip 192.168.56.1
```

### Agent connection issues
- Check Windows firewall
- Verify IP configuration
- Ensure agent.py is running