## Build

FROM golang:1.18-alpine AS build

RUN mkdir /app
WORKDIR /app
COPY ./src /app

RUN go mod download
RUN go build -o /bin

## Deploy

FROM alpine:latest
MAINTAINER Help-14 [mail@help14.com]
LABEL maintainer="mail@help14.com"

RUN mkdir /app

COPY --from=build /bin/magma /app/
COPY ./src/common /app/common
COPY ./src/languages /app/languages
COPY ./src/sample /app/sample
COPY ./src/themes /app/themes

EXPOSE 7001

WORKDIR /app
ENTRYPOINT ./magma