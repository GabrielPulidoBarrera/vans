FROM node:lts AS base
WORKDIR /app

# Copiar archivos de dependencias primero (para aprovechar caché)
COPY package.json package-lock.json ./

FROM base AS prod-deps
RUN npm install --omit=dev

FROM base AS build-deps
RUN npm install

FROM build-deps AS build
COPY . .

RUN echo "Current directory contents:" && ls -la && \
    echo "Checking src/components/dashboard:" && ls -la src/components/dashboard/ || echo "Directory missing" && \
    echo "Searching for TanstackTable:" && find . -name "TanstackTable.tsx" -type f

RUN npm run build

# =============================================
# Etapa final (runtime)
# =============================================
FROM base AS runtime

# Instalar Google Chrome y dependencias del sistema necesarias para Puppeteer
# Se usa --no-install-recommends para mantener la imagen ligera
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Agregar el repositorio oficial de Google Chrome e instalarlo
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configurar Puppeteer para usar el Chrome del sistema y no descargar Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copiar las dependencias de producción y el código compilado
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

# (Opcional) Si encuentras errores de sandbox, puedes añadir el flag --no-sandbox al lanzar puppeteer.
# En tu código: puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
CMD ["node", "./dist/server/entry.mjs"]