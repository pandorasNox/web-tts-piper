#!/usr/bin/env bash

set -Eeuo pipefail;

# =============================================================================
# 

func_dev() {(
    set -Eeuo pipefail;

    printf 'server app... \n' "";
    docker compose build;
    docker compose up -d;

    docker compose exec cli ash -ceu "cd web-tts-piper; npm run dev"
)}

func_cli() {(
    set -Eeuo pipefail;

    printf 'start cli\n' ""
    docker compose up -d
    docker compose exec cli ash
)}

# =============================================================================

if test "${1}" = "cli"; then
    func_cli;
    exit 0;
fi

if test "${1}" = "dev"; then
    func_dev;
    exit 0;
fi
