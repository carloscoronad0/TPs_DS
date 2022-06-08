FROM node
WORKDIR /usr/src/app
COPY Project .
RUN npm install
EXPOSE 1883
CMD ["export" ,"IP=$(hostname -I)"]
CMD ["node", "./app.js"]