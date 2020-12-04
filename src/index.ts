import { TwitterClient } from "twitter-api-client";
import { TwitterBot } from "./bot";
const chalk = require("chalk");
require("dotenv").config();

//https://kaffeine.herokuapp.com/

let tryNumber = 1;

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
        `\n${chalk.blue(
          "Date&Time"
        )}: ${new Date().toLocaleString()}\n${chalk.blue("Tweet")}: \n\n──────────────────────────────────────────────────────────────────────────────────────\n${
          tweet.full_text
        }\n──────────────────────────────────────────────────────────────────────────────────────`
      );

      twitterBot.participate(result, tweet);
    });
  });
  console.log("\n#############################################");
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

  console.log(
    chalk.cyan(
      `\n|------------------- ${new Date().toLocaleString()} Iteration nº ${tryNumber} ---------------------|\n`
    )
  );

  for (let target of targets) {
    console.log(chalk.yellow(`\nNew check to --> ${target}`));
    await assertNewTweet(target);
  }

  tryNumber += 1;
}

console.log(
  chalk.green(
    `\nTWTOTES started with an interval of ${Number(
      process.env.INTERVAL_S!
    )} seconds`
  )
);

setInterval(doStuff, Number(process.env.INTERVAL_S!) * 1000);
