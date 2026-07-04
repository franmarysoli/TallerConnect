# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código del proyecto
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servidor (Nginx)
FROM nginx:alpine

# Copiar la configuración personalizada de Nginx para soportar React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
