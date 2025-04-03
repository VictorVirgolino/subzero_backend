#!/bin/sh
until pg_isready -h db -U postgres; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done
