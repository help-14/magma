FROM denoland/deno:alpine-1.19.3

MAINTAINER Help-14 [mail@help14.com]
LABEL maintainer="mail@help14.com"

RUN mkdir /app
WORKDIR /app
COPY src/* ./

CMD deno run --allow-net --allow-read --allow-write main.ts