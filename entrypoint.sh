#!/bin/sh
set -e

# 1️⃣ CUPS starten
cupsd
sleep 2

# 2️⃣ Debug / verfügbare Treiber prüfen (optional)
lpinfo -m | grep -i generic || true

# 3️⃣ Drucker nur anlegen, wenn er noch nicht existiert
if ! lpstat -p HP2015DN >/dev/null 2>&1; then
  lpadmin \
    -p HP2015DN \
    -E \
    -v socket://10.0.0.165:9100 \
    -m drv:///sample.drv/generic-ps.ppd
fi

# 4️⃣ Duplex als Default aktivieren
lpoptions -p HP2015DN -o sides=two-sided-long-edge

# 5️⃣ Node.js starten
exec node src/server.js
