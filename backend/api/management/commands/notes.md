1. plug in 

`lsblk`

`udevadm info --query=all --name=/dev/sdb1`

Replace /dev/sdb1 with your actual device. Look for unique identifiers like ID_VENDOR, ID_MODEL, ID_SERIAL, etc. You'll use these to write your udev rule.

2. Create a file /etc/udev/rules.d/99-kindle-import.rules with content like:

`Automatically import clippings when Kindle is plugged in:`
`ACTION=="add", SUBSYSTEM=="block", KERNEL=="sd?1", ENV{ID_VENDOR}=="Amazon", RUN+="/usr/local/bin/kindle-import.sh %k"`

KERNEL=="sd?1" means the first partition of any SDB, SDC, etc.

Adjust ENV{ID_VENDOR}=="Amazon" if your Kindle vendor is different (check with udevadm info).

%k passes the kernel device name (e.g., sdb1) to the script.

3. Create the script /usr/local/bin/kindle-import.sh

4. Make the script executable:

`sudo chmod +x /usr/local/bin/kindle-import.sh`

5. Reload udev rules and test

`sudo udevadm control --reload`

`sudo udevadm trigger`
