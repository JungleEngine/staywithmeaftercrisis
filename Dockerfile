FROM node:13.12.0-alpine3.11

WORKDIR /swmac/

EXPOSE 8080

ADD . /swmac/

CMD "./run.sh"
