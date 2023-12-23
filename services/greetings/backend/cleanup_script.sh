#!/bin/sh

folder_path="/app/data"

interval=1700

while true; do
    find "$folder_path" -type f -mmin +15 -delete

    sleep "$interval"
done
