FROM node
EXPOSE 50051
EXPOSE 50052
WORKDIR /usr/src/app
COPY app .
COPY protos /usr/src/protos
RUN npm install
RUN npm install ip
CMD ["node", "file-slave-node.js", "."]
