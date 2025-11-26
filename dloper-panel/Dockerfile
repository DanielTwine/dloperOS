FROM node:18-bullseye
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
COPY public ./public
EXPOSE 4173
CMD ["npm", "start"]
