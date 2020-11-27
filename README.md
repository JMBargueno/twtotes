# twtotes

Bot en node y typescript para twitter

Se necesita crear un .env en el path con los siguientes valores:

API_KEY=
API_SECRET=
ACCESS_TOKEN=
ACCESS_TOKEN_SECRET=
TARGET=
FRIEND=
INTERVAL_S=30

Los 4 primeros, necesitan de tener una cuenta dev en twitter.
https://developer.twitter.com/en

Importante al desplegar en heroku, configurar el dyno como worker y no como web.