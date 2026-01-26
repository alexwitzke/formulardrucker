#!/bin/bash
set -e

# CUPS starten im Vordergrund
cupsd -f &

# kurze Wartezeit, bis CUPS bereit ist
sleep 2

# Drucker nur anlegen, wenn er noch nicht existiert
# if ! lpstat -p HP2015DN >/dev/null 2>&1; then
#     echo "Richte Drucker HP2015DN ein..."
#     # HPLIP Treiber
#     lpadmin -p HP2015DN -E -v socket://10.0.0.165:9100 -m hpcups

#     # Standard-Druckoptionen
#     lpoptions -p HP2015DN -o sides=two-sided-long-edge
# fi

# Node.js starten
# exec node src/server.js
