#!/bin/bash
# This script is not currently meant to be executed from within the repository.
# Copy or symlink it to some deployment directory.

set -ex

# Defaults for production.
# Example for development:
#   PORT=8100 OPENFISCA_PORT=2000 OPENFISCA_CONFIG=development PUBLIC_URL=http://next.mes-aides.sgmap.fr ./deploy.sh aah
TARGET_BRANCH=${1:-master}  # demo
PORT=${PORT:-8000}  # 8100
OPENFISCA_PORT=${OPENFISCA_PORT:-12000}  # 2000
OPENFISCA_CONFIG=${OPENFISCA_CONFIG:-mes-aides}  # development
PUBLIC_URL=${PUBLIC_URL:-https://mes-aides.gouv.fr}  # http://next.mes-aides.sgmap.fr

# Install Mes Aides
if ! cd mes-aides-ui
then
    git clone https://github.com/sgmap/mes-aides-ui.git
    cd mes-aides-ui
fi

git fetch origin $TARGET_BRANCH
git checkout origin/$TARGET_BRANCH

rm -rf node_modules # work around libsass bindings being never found
npm install
grunt build

# Stop Mes Aides
killall --user `whoami` node || echo 'No server was running'
# Start Mes Aides
OPENFISCA_URL="http://localhost:$OPENFISCA_PORT" SESSION_SECRET=foobar NODE_ENV=production MES_AIDES_ROOT_URL="$PUBLIC_URL" PORT=$PORT MONGODB_URL="mongodb://localhost/$(whoami)" nohup node server.js >> ../mes-aides_log.txt &

cd ..

# Install OpenFisca
if ! cd openfisca
then
    git clone https://github.com/sgmap/openfisca.git
    cd openfisca
fi

git fetch origin $TARGET_BRANCH
git checkout origin/$TARGET_BRANCH

./update.sh --dev

# Stop OpenFisca
killall --user `whoami` /usr/bin/python || echo 'No OpenFisca server was running'
# Start OpenFisca
nohup ./start.sh $OPENFISCA_CONFIG >> ../openfisca_log.txt &

cd ..

set +x

echo "===================="
echo "Déploiement effectué"
echo "Attente du démarrage du serveur OpenFisca…"

sleep 10

# Smoke test
curl -sL -w "GET %{url_effective} -> %{http_code}\\n" localhost:$OPENFISCA_PORT -o /dev/null
curl -sL -w "GET %{url_effective} -> %{http_code}\\n" localhost:$PORT -o /dev/null
curl -sL -w "GET %{url_effective} -> %{http_code}\\n" $PUBLIC_URL -o /dev/null
