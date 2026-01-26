#!/bin/sh
set -e

# 1️⃣ CUPS starten
cupsd
sleep 2

# 2️⃣ Debug: vorhandene Treiber / Drucker prüfen
lpinfo -m | grep -i raster || true

# 3️⃣ Drucker nur anlegen, wenn er noch nicht existiert
if ! lpstat -p HP2015DN >/dev/null 2>&1; then
  # Option A: RAW Socket
  lpadmin -p HP2015DN -E -v socket://10.0.0.165:9100 -m raw
  
  # Option B (falls du Raster bevorzugst):
  # lpadmin -p HP2015DN -E -v socket://10.0.0.165:9100 -m pwgraster
fi

# 4️⃣ Duplex als Default setzen
lpoptions -p HP2015DN -o sides=two-sided-long-edge

# 5️⃣ Node.js starten
exec node src/server.js
