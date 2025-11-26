FROM node:18-bullseye
WORKDIR /app
COPY package*.json tsconfig.json ./
COPY prisma ./prisma
RUN npm install
COPY src ./src
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/index.js"]
