#!/bin/bash
export PORT=${PORT:-5001}
gunicorn app:app --bind 0.0.0.0:$PORT
