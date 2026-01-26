FROM node:20-bookworm

RUN apt-get update && \
    apt-get install -y cups cups-client ghostscript && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY src ./src
COPY public ./public
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
