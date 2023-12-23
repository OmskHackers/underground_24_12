FROM golang:1.20.5-alpine

WORKDIR /app

COPY . .

RUN go mod download

RUN chmod +x cleanup_script.sh

CMD ["sh", "-c", "./cleanup_script.sh & go run ."]