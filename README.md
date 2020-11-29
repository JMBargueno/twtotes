# Twtotes

Twtotes is a Twitter bot developed in node using typescript. In principle, this bot is created to auto-participate in twitter giveaways.

## Instructions

### Initial config

To start, you have to create an .env in the root of the app and then create the following values ​​within the file:

- API_KEY=string
- API_SECRET=string
- ACCESS_TOKEN=string
- ACCESS_TOKEN_SECRET=string
- TARGETS=string[]
- FRIENDS=string[]
- INTERVAL_S=number (of seconds)

To get the values ​​of the first four variables, you need a [developer account on twitter](https://developer.twitter.com/en)

When you have done the previous steps, the ideal would be to configure the array of random phrases, located in 'src/core/data/reply.data.ts'

### Starting app

To start the app, in the root of the project use 'npm i' and then 'npm run build'

### Deployment

If you deploy in heroku, remember to select the dyno worker.

### Reading more docs

For read more docs, in the root of the project use 'npm run docs'
