#!/bin/bash
set -e

echo "==> Setting up SysMon Frontend"
cd "$(dirname "$0")/frontend"

# Install dependencies
npm install

echo "==> Starting React dev server on port 3000..."
npm start
