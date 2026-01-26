# Basis: Ubuntu 22.04
FROM ubuntu:22.04

# Pakete: CUPS, HPLIP, Node.js, curl, git
RUN apt-get update && apt-get install -y \
    cups \
    hplip \
    nodejs \
    npm \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis
WORKDIR /app

# App kopieren
COPY ./src /app/src
COPY package.json /app/package.json

# Node.js Abhängigkeiten installieren
RUN npm install

# PDFs Volume
VOLUME /data/pdfs

# entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Start
CMD ["/entrypoint.sh"]
