import { TwitterClient } from "twitter-api-client";
import { TwitterBot } from "./bot";
require("dotenv").config();

//https://kaffeine.herokuapp.com/

async function assertNewTweet(target: string) {
  let twitterClient = new TwitterClient({
    apiKey: process.env.API_KEY!,
    apiSecret: process.env.API_SECRET!,
    accessToken: process.env.ACCESS_TOKEN!,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  });
  let twitterBot = new TwitterBot(target, twitterClient, process.env.FRIEND!);

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

function getTargetArray() {
  return process.env.TARGETS!.split(",");
}

async function doStuff() {
  const targets = getTargetArray();

  for (let target of targets) {
    console.log("\n##########################################");
    console.log(`\nNuevo try a ${target}`);
    await assertNewTweet(target);
    console.log("\n##########################################");
  }
}

console.log(
  `TWTOTES iniciado con un intervalo de ${Number(
    process.env.INTERVAL_S!
  )} segundos`
);

setInterval(doStuff, Number(process.env.INTERVAL_S!) * 1000);
