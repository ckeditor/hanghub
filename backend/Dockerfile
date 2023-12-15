# Copyright (c) 2003-2023, CKSource Holding sp. z o.o.. All rights reserved.
# This file is licensed under the terms of the MIT License (see LICENSE.md).

FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY src ./src
RUN touch ./.env

EXPOSE 3000
CMD [ "npm", "start" ]
