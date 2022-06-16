#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /app
EXPOSE 88
EXPOSE 443
EXPOSE 30051

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src/server
COPY ["/GreeterServer/MasterServer.csproj", ""]
RUN dotnet restore "./MasterServer.csproj"
COPY . .

WORKDIR /src/protos
COPY ["/Greeter/Protos.csproj", ""]
RUN dotnet restore "./Protos.csproj"
COPY . .
WORKDIR "/src/server/."
RUN dotnet build "MasterServer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MasterServer.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MasterServer.dll"]