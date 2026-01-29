#!/bin/bash
set -e

PRINTER_NAME_A4="HP2015DN_A4"
PRINTER_NAME_A4_DUPLEX="HP2015DN_A4_Duplex"
PRINTER_NAME_A6_MANUAL="HP2015DN_A6_Manual"
PRINTER_URI="socket://10.0.0.165:9100"
PRINTER_PPD="drv:///hpcups.drv/hp-laserjet_p2015dn_series.ppd"

echo "Starte CUPS..."
cupsd -f &
sleep 3

# until lpstat -r >/dev/null 2>&1; do
#   sleep 1
# done

# # A4 Drucker
# if ! lpstat -p "$PRINTER_NAME_A4" >/dev/null 2>&1; then
#   echo "Richte Drucker $PRINTER_NAME_A4 ein..."
#   lpadmin \
#     -p "$PRINTER_NAME_A4" \
#     -E \
#     -v "$PRINTER_URI" \
#     -o media=A4 \
#     -o InputSlot=Upper \
#     -m "$PRINTER_PPD"

#   lpadmin -p "$PRINTER_NAME_A4" -o OptionDuplex=False

#   cupsenable "$PRINTER_NAME_A4"
#   cupsaccept "$PRINTER_NAME_A4"
# fi

# A4 Duplex Drucker
if ! lpstat -p "$PRINTER_NAME_A4_DUPLEX" >/dev/null 2>&1; then
  echo "Richte Drucker $PRINTER_NAME_A4_DUPLEX ein..."
  lpadmin \
    -p "$PRINTER_NAME_A4_DUPLEX" \
    -E \
    -v "$PRINTER_URI" \
    -o media=A4 \
    -o sides=two-sided-long-edge \
    -o InputSlot=Upper \
    -m "$PRINTER_PPD"

  lpadmin -p "$PRINTER_NAME_A4_DUPLEX" -o OptionDuplex=True

  cupsenable "$PRINTER_NAME_A4_DUPLEX"
  cupsaccept "$PRINTER_NAME_A4_DUPLEX"
fi

# A6 Manueller Einzug
if ! lpstat -p "$PRINTER_NAME_A6_MANUAL" >/dev/null 2>&1; then
  echo "Richte Drucker $PRINTER_NAME_A6_MANUAL ein..."
  lpadmin \
    -p "$PRINTER_NAME_A6_MANUAL" \
    -E \
    -v "$PRINTER_URI" \
    -m "$PRINTER_PPD" \
    -o media=A6 \
    -o PageSize=A6
    -o InputSlot=Manual \
    -o sides=one-sided

  cupsenable "$PRINTER_NAME_A6_MANUAL"
  cupsaccept "$PRINTER_NAME_A6_MANUAL"
fi

echo "Starte Node.js App..."
exec node src/server.js
