# --- Stage 1: Build -----------------------------------------------------------
FROM node:20-alpine AS builder

# Install dependencies
WORKDIR /app

# Install deps first (leverages Docker layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy rest of the source
COPY . .

# Build the project (type-checking + Vite build)
RUN npm run build

# --- Stage 2: Runtime --------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

LABEL org.opencontainers.image.source="https://github.com/cincibrainlab/Autoclean-ConfigWizard"

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static build output from builder image
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/run && \
    chown -R nginx:nginx /usr/share/nginx/html

# Ensure non-root runtime (nginx user exists by default)
USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"] 