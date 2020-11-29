import { StatusesUserTimeline, TwitterClient } from "twitter-api-client";
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

  await twitterBot.getUser().then(async (result) => {
    await twitterBot.getTweet(result.screen_name).then((res) => {
      let tweet: any = res;

      /* console.log(tweet);
      console.log(tweet.id_str);
      console.log(tweet.full_text);
      console.log(tweet.entities.hashtags);
      console.log(tweet.entities.user_mentions);
      console.log(tweet.favorited);
      console.log(tweet.retweeted); */

      console.log(
        `\nInstante: ${new Date().toLocaleString()}\nTweet: ${
          tweet.full_text
        }\nMarcado como favorito: ${tweet.favorited}\nRetweeteado: ${
          tweet.retweeted
        }`
      );

      twitterBot.participate(result, tweet);
    });
    
  });

  
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
