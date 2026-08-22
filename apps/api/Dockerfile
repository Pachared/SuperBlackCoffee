FROM golang:1.25-alpine AS build
WORKDIR /app
COPY . .
RUN go build -o api ./cmd/api
FROM alpine:3.21
WORKDIR /app
COPY --from=build /app/api .
EXPOSE 8080
CMD ["./api"]
