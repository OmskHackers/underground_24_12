FROM ubuntu:22.04

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
    && apt-get install -y python3-pip python3-dev build-essential \
    && apt-get clean

WORKDIR /app

COPY requirements.txt /app/

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . /app

ENV FLASK_APP=zapiski.py
ENV FLASK_RUN_HOST=0.0.0.0
CMD flask run
