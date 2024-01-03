#!/bin/bash

docker run --name=zapiski_srv --restart=always -p 5000:5000 -dt zapiski_srv
