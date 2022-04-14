## Build

FROM golang:1.16-alpine AS build

RUN mkdir /app
WORKDIR /app

COPY ./src/main.go /app/
COPY ./src/go.mod /app/
COPY ./src/go.sum /app/
COPY ./src/modules /app/

RUN go build -o /bin

## Deploy

FROM alpine:latest
MAINTAINER Help-14 [mail@help14.com]
LABEL maintainer="mail@help14.com"

RUN mkdir /app
WORKDIR /app

COPY --from=build /bin /app

EXPOSE 7001
ENTRYPOINT magma