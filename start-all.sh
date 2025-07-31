#!/bin/bash

# backend
echo "Starting backend..."
(cd backend && python manage.py runserver) &

# frontend
echo "Starting frontend..."
(cd frontend && npm start)
