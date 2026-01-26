# Basis-Image Node.js
FROM node:20-bookworm

# 1️⃣ Systempakete installieren: CUPS, cups-client, Ghostscript
RUN apt-get update && \
    apt-get install -y cups cups-client cups-filters ghostscript && \
    rm -rf /var/lib/apt/lists/*

# 2️⃣ Arbeitsverzeichnis
WORKDIR /app

# 3️⃣ Node.js Dependencies
COPY package*.json ./
RUN npm install

# 4️⃣ Projektdateien kopieren
COPY src ./src
COPY public ./public

# 5️⃣ entrypoint Script kopieren
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 6️⃣ Volumes & Ports
VOLUME /data
EXPOSE 3000

# 7️⃣ Start des Containers
ENTRYPOINT ["/entrypoint.sh"]
