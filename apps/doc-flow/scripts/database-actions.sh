#!/bin/bash
set -e

echo "Running database action";

function migrate() {
  echo "Running migration";
  npx sequelize-cli db:migrate; 
}

function seed() {
  echo "Running seed";
  npx sequelize-cli db:seed:all;
}

$1