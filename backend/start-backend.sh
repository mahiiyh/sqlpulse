#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20
export $(cat .env | xargs)
npm run dev
