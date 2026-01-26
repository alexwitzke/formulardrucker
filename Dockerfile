FROM ubuntu:22.04

# Grundpakete + CUPS + HPLIP + Ghostscript
RUN apt-get update && apt-get install -y \
    cups \
    hplip \
    ghostscript \
    curl \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis
WORKDIR /app

# App kopieren
COPY ./src /app/src
COPY package.json /app/package.json

# Node.js Dependencies
RUN npm install

# PDFs Volume
VOLUME /data/pdfs

# CUPS starten + Drucker anlegen + Node.js starten
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
