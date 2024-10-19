# Usa la imagen oficial de Node.js (versión 22) como base
FROM node:22

# Establece la zona horaria a Guatemala
ENV TZ=America/Guatemala
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el package.json y el package-lock.json
COPY package*.json ./

# Instalar las dependencias de producción
RUN npm ci --omit=dev --legacy-peer-deps

# Instalar la CLI de NestJS solo temporalmente para compilar, ignorando dependencias conflictivas
RUN npm install @nestjs/cli --legacy-peer-deps

# Copiar todo el código de la aplicación
COPY . .

# Compilar la aplicación
RUN npm run build

# Remover la CLI de NestJS después de la compilación, con --legacy-peer-deps
RUN npm uninstall @nestjs/cli --legacy-peer-deps

# Exponer el puerto en el que corre la aplicación (por defecto 3000)
EXPOSE 3000

# Comando por defecto para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
