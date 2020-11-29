import { TwitterClient } from "twitter-api-client";
import { TwitterBot } from "./bot";
require("dotenv").config();

//https://kaffeine.herokuapp.com/

async function assertNewTweet() {
  let twitterClient = new TwitterClient({
    apiKey: process.env.API_KEY!,
    apiSecret: process.env.API_SECRET!,
    accessToken: process.env.ACCESS_TOKEN!,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  });
  let twitterBot = new TwitterBot(
    process.env.TARGET!,
    twitterClient,
    process.env.FRIEND!
  );

 twitterBot.getRandomFriend()
  await twitterBot.getUser().then((result) => {
    console.log(
      `\nInstante: ${new Date().toLocaleString()}\nTweet: ${
        result.status.text
      }\nMarcado como favorito: ${result.status.favorited}\nRetweeteado: ${
        result.status.retweeted
      }`
    );
    twitterBot.participate(result);
  });

  //
}

console.log(
  `TWTOTES iniciado con un intervalo de ${Number(
    process.env.INTERVAL_S!
  )} segundos`
);


async function doStuff() {
  console.log("\n##########################################");
  console.log("\nNuevo try");
  await assertNewTweet();
  console.log("\n##########################################");
}

setInterval(doStuff, Number(process.env.INTERVAL_S!) * 1000);
