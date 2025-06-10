#!/bin/bash

DEVICE="/dev/$1"
MOUNT_POINT="/mnt/kindle"

# Create mount point if missing
mkdir -p "$MOUNT_POINT"

# Mount device read-only (for safety)
udisksctl mount -b "$DEVICE"

# Give time for mount to settle
sleep 2

# Find where it was mounted (usually /media/username/Kindle or similar)
MOUNT_PATH=$(lsblk -o MOUNTPOINT -nr "$DEVICE")

if [ -z "$MOUNT_PATH" ]; then
  echo "Failed to detect mount point"
  exit 1
fi

# Copy clippings file to home directory with date
CLIPPINGS_SRC="$MOUNT_PATH/documents/My Clippings.txt"
CLIPPINGS_DEST="$HOME/Dokumenty/clippings-$(date +%Y-%m-%d-%H%M%S).txt"

if [ -f "$CLIPPINGS_SRC" ]; then
    cp "$CLIPPINGS_SRC" "$CLIPPINGS_DEST"
    echo "Copied clippings to $CLIPPINGS_DEST"
else
    echo "Clippings file not found"
    exit 1
fi

# Unmount device
udisksctl unmount -b "$DEVICE"

# Run Django import command
cd /path/to/your/django/project || exit 1
source /path/to/your/venv/bin/activate

python manage.py import_clippings "$CLIPPINGS_DEST"
