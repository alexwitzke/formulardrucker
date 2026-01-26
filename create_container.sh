#!/bin/bash

set -e

container="formulardrucker"
repo="https://github.com/alexwitzke/formulardrucker.git"
appdata="/mnt/user/appdata/formulardrucker"

echo "Stopping container (if running)"
docker stop $container 2>/dev/null || true
docker rm $container 2>/dev/null || true

echo "Cleaning old source"
rm -rf $container

echo "Cloning repository"
git clone $repo

cd $container

echo "Building container"
docker build -t $container:latest .

echo "Running container"
docker run -d \
  --name $container \
  -p 3000:3000 \
  -v $appdata:/data \
  --restart unless-stopped \
  $container:latest

echo "Cleanup source directory"
cd ..
rm -rf $container

echo "Done."
