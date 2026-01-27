FROM ubuntu:22.04

# System + Druck + Node.js
RUN apt-get update && apt-get install -y \
    cups \
    hplip \
    hplip-data \
    cups-filters \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis
WORKDIR /app

# App kopieren
COPY package.json /app/package.json
COPY src /app/src

# Node-Abhängigkeiten
RUN npm install

# Konfig / PDFs von außen
VOLUME /data

# entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["bash", "/entrypoint.sh"]
