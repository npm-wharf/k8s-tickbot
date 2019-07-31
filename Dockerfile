FROM node:8-alpine

MAINTAINER "Alex Robson <asrobson@gmail.com>"

RUN apk add --no-cache git make g++
RUN mkdir -p /app/lib
COPY ./lib /app/lib
COPY ./bin /app/bin
COPY ./package.json /app
RUN npm i /app -g --unsafe-perm

ENTRYPOINT [ "tickbot" ]
