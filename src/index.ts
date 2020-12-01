import { StatusesUserTimeline, TwitterClient } from "twitter-api-client";
import { TwitterBot } from "./bot";
require("dotenv").config();

//https://kaffeine.herokuapp.com/

/**
 * Contains the main flow of the app
 *
 * @param target User
 */
async function assertNewTweet(target: string) {
  let twitterClient = new TwitterClient({
    apiKey: process.env.API_KEY!,
    apiSecret: process.env.API_SECRET!,
    accessToken: process.env.ACCESS_TOKEN!,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  });

  let twitterBot = new TwitterBot(target, twitterClient);

  await twitterBot.getUser().then(async (result) => {
    await twitterBot.getTweet(result.screen_name).then((res) => {
      let tweet: any = res;

      console.log(
        `\nDate&Time: ${new Date().toLocaleString()}\nTweet: ${tweet.full_text}`
      );

      twitterBot.participate(result, tweet);
    });
  });
}

/**
 * Forms the array of targets supplied in the .env
 *
 */
function getTargetArray() {
  return process.env.TARGETS!.split(",");
}

/**
 * Starts checking for new tweets on all provided targets in the array
 *
 */
async function doStuff() {
  const targets = getTargetArray();

  for (let target of targets) {
    console.log(`\nNew check to ${target}`);
    await assertNewTweet(target);
  }
}

console.log(
  `TWTOTES started with an interval of ${Number(
    process.env.INTERVAL_S!
  )} seconds`
);

setInterval(doStuff, Number(process.env.INTERVAL_S!) * 1000);
