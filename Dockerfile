# Windows Server Core Base Image
FROM mcr.microsoft.com/windows/servercore:ltsc2022

# Node.js installieren
RUN powershell -Command `
    Invoke-WebRequest https://nodejs.org/dist/v20.5.1/node-v20.5.1-x64.msi -OutFile nodejs.msi ; `
    Start-Process msiexec.exe -ArgumentList '/i','nodejs.msi','/quiet','/norestart' -Wait ; `
    Remove-Item nodejs.msi -Force

# Arbeitsverzeichnis
WORKDIR C:/app

# App kopieren
COPY ./src C:/app/src
COPY package.json C:/app/package.json
RUN npm install

# Freigabe PDFs (optional)
VOLUME C:/data/pdfs

# Node.js starten
# CMD ["node", "src/server.js"]
# CMD ["node", "src/server.js"]
