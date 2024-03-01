#!/bin/bash

podman stop mongodb-container
podman rm mongodb-container
podman run -d --name mongodb-container -p 27017:27017 -v ./data:/data/db mongo:latest
