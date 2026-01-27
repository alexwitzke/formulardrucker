# Ubuntu 22.04
FROM ubuntu:22.04

# Basis-Pakete
RUN apt-get update && apt-get install -y \
    curl \
    hplip \
    cups \
    cups-filters \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 installieren
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm \
    && rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis
WORKDIR /app

# App kopieren
COPY package.json /app/package.json
COPY src /app/src

# Node-Abhängigkeiten
RUN npm install

# Volume für PDFs / config
VOLUME /data

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["bash", "/entrypoint.sh"]
