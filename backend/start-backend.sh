#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20 > /dev/null 2>&1

export ENCRYPTION_KEY="396cdc07a41dbce71fea2459e6d80f10"
export DATABASE_URL="postgresql://sqlquery_user:sqlquery_pass@localhost:5432/sqlquery_db"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET="563514eb0ff479895640595f068dddcb326acabffc6f23428b0d58ede9d86ec3"
export NODE_ENV="development"
export PORT="3001"

npm run dev
