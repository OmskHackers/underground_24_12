FROM ubuntu:20.04

RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y python3-pip

RUN apt-get install -y sqlite

RUN python3 -m pip install pycryptodome
RUN python3 -m pip install aiosqlite
RUN python3 -m pip install sympy

RUN mkdir /service
WORKDIR /service
RUN mkdir data

COPY app/ init.sql run.sh ./

RUN groupadd -g 2000 cryptokekgroup \
&& useradd -m -u 2001 -g cryptokekgroup cryptokek

RUN chown -R cryptokek /service
RUN chmod +x main.py run.sh

CMD ["/service/run.sh"]
