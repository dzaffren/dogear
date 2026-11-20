#!/usr/bin/env bash
# Runs the Forge CLI with the credentials from .env and the Node in .nvmrc.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
set -a
# shellcheck disable=SC1091
source "$root/.env"
set +a
export FORGE_API_TOKEN="$ATLASSIAN_API_KEY"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
source "$NVM_DIR/nvm.sh" >/dev/null
nvm use "$(cat "$root/.nvmrc")" >/dev/null
exec forge "$@"
