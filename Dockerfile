FROM denoland/deno:alpine-1.19.3

MAINTAINER Help-14 [mail@help14.com]
LABEL maintainer="mail@help14.com"

COPY src/* /app/
WORKDIR /app

CMD deno run --allow-net --allow-read --allow-write main.ts