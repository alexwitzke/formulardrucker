#!/bin/sh
set -e

# CUPS starten
cupsd
sleep 2

# Debug / Verifikation (optional, aber hilfreich)
lpinfo -m | grep -i generic || true

# Drucker nur anlegen, wenn er noch nicht existiert
if ! lpstat -p HP2015DN >/dev/null 2>&1; then
  lpadmin \
    -p HP2015DN \
    -E \
    -v socket://10.0.0.165:9100 \
    -m drv:///sample.drv/generic.ppd
fi

# Node.js starten
exec node src/server.js
