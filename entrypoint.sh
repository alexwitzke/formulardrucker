#!/bin/bash
set -e

PRINTER_NAME="HP2015DN"
PRINTER_URI="socket://10.0.0.165:9100"
PRINTER_PPD="drv:///hpcups.drv/hp-laserjet_p2015dn_series.ppd"

echo "Starte CUPS..."
cupsd -f &
sleep 3

# Drucker anlegen (idempotent)
if ! lpstat -p "$PRINTER_NAME" >/dev/null 2>&1; then
  echo "Richte Drucker $PRINTER_NAME ein..."
  lpadmin \
    -p "$PRINTER_NAME" \
    -E \
    -v "$PRINTER_URI" \
    -m "$PRINTER_PPD"

  cupsenable "$PRINTER_NAME"
  cupsaccept "$PRINTER_NAME"
fi

echo "Aktiviere Duplex..."
lpoptions -p "$PRINTER_NAME" -o OptionDuplex=True
lpoptions -p "$PRINTER_NAME" -o sides=two-sided-long-edge

echo "Starte Node.js App..."
exec node src/server.js
