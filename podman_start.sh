#!/bin/bash

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Please use this script like this: bash podman_start.sh mail_user mail_password mongodb_host [mongodb_port]"
else
    MAIL_USER=$1
    MAIL_PASSWORD=$2
    MONGODB_HOST=$3
    MONGODB_PORT=${4:-27017}
    
    if nc -zv -w 2 $3 $MONGODB_PORT &> /dev/null; then
        echo "MongoDB is reachable ..."
        echo "Starting podman container ..."
        echo "Using user '$MAIL_USER'"
        echo "Using app password '$MAIL_PASSWORD'"
        echo "Using mongodb host '$MONGODB_HOST'"
        echo "Using mongodb port '$MONGODB_PORT'"
        podman run -d --name todolist-app-container -p 3100:3100 -e MAIL_USER=$MAIL_USER -e MAIL_PASSWORD="$MAIL_PASSWORD" -e MONGODB_HOST=$MONGODB_HOST:$MONGODB_PORT todolist-app:latest
        echo "Podman container successfully started"
    else
        echo "MongoDB is not reachable at $MONGODB_HOST:$MONGODB_PORT"
    fi
fi
