FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY lib ./lib
COPY manifests ./manifests
COPY public ./public
COPY server.mjs ./server.mjs

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4317 \
    BROWSER_CHANNEL=chromium \
    PUBLIC_DEMO_MODE=true \
    NEBIUS_INFERENCE_APPROVED=false

EXPOSE 4317
VOLUME ["/app/artifacts"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4317/api/status').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["node", "server.mjs"]

