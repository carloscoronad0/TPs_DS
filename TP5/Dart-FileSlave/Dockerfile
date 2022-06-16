FROM dart:stable

RUN apt update

# Getting and configuring the necessary tools to work with grpc
RUN apt install -y protobuf-compiler
RUN ["dart", "pub", "global", "activate", "protoc_plugin"]
ENV PATH="${PATH}:/root/.pub-cache/bin"

# Port for GetFile service
EXPOSE 50051
EXPOSE 50052
EXPOSE 30000-40000/tcp

WORKDIR /file-slave
COPY file-slave .

RUN dart pub get
RUN ["protoc", "-I", "protos", "protos/getfile.proto", "--dart_out=grpc:./lib/src/getfile_service"]
RUN ["protoc", "-I", "protos", "protos/registry.proto", "--dart_out=grpc:./lib/src/register_service"]

CMD ["dart", "./bin/file_slave.dart", "/etc"]
