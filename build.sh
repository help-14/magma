#!/bin/bash
docker build -t magma -f- ./ < Dockerfile
docker tag magma:latest help14/magma:latest