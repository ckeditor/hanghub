# Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
# This file is licensed under the terms of the MIT License (see LICENSE.md).

FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY src ./src
COPY .env ./

EXPOSE 3000
CMD [ "npm", "start" ]
