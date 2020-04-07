#!/bin/sh
echo "inside run.sh"
npm install
npx sequelize db:migrate
npm start
