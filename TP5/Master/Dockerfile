#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443
EXPOSE 50051
EXPOSE 50052
EXPOSE 21242
EXPOSE 1883

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src/protos
COPY ["/protos/Protos.csproj", "."]
RUN dotnet restore "./Protos.csproj"
COPY "/protos/." .

WORKDIR /src/server
COPY ["/GreeterServer/MasterServer.csproj", "."]
RUN dotnet restore "./MasterServer.csproj"
COPY "/GreeterServer/." .

WORKDIR "/src/server"

RUN dotnet build "MasterServer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MasterServer.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MasterServer.dll"]