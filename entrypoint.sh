#!/bin/bash
set -e

# CUPS starten
cupsd -f &

# 2 Sekunden warten, damit CUPS läuft
sleep 2

# Drucker nur anlegen, wenn er noch nicht existiert
if ! lpstat -p HP2015DN >/dev/null 2>&1; then
  # IPP-Treiber über HPLIP
  lpadmin -p HP2015DN -E -v socket://10.0.0.165:9100 -m hpcups

  # Standard-Druckoptionen setzen
  lpoptions -p HP2015DN -o sides=two-sided-long-edge
fi

# Node.js Server starten
# exec node src/server.js
