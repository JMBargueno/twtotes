import { StatusesUserTimeline, TwitterClient } from "twitter-api-client";
import TweetsClient from "twitter-api-client/dist/clients/TweetsClient";
import UsersShow, {
  Status,
} from "twitter-api-client/dist/interfaces/types/UsersShowTypes";
import { REPLYDATA } from "./core/data/reply.data";
import { KEYWORDSDATA } from "./core/data/sentences.data";
import { getRandomArbitrary } from "./core/functions/functions";
const chalk = require("chalk");

/**
 * Clase twitter bot
 *
 */
export class TwitterBot {
  constructor(
    private targetUsername: string,
    private twitterClient: TwitterClient
  ) {}

  /**
   * Get user data by string username
   *
   */
  async getUser(): Promise<UsersShow> {
    let data = await this.twitterClient.accountsAndUsers.usersShow({
      screen_name: this.targetUsername,
    });
    return Promise.resolve(data);
  }

  /**
   * Consider if the tweet its a giveaway
   *
   * @param tweet
   */
  private isGiveaway(tweet: string): boolean {
    let result: boolean = false;
    let counter = 0;

    for (let keyword of KEYWORDSDATA) {
      if (tweet.includes(keyword)) {
        counter += 1;
      }
    }
    if (tweet.includes("#") && counter >= 2) {
      result = true;
    }

    return result;
  }

  /**
   * Return hashtags in a tweet
   *
   * @param tweet
   */
  private getHashtags(tweet: any): string[] {
    return tweet.entities.hashtags;
  }

  /**
   * Return mentions in a tweet
   *
   * @param tweet
   */
  private getMentions(tweet: any) {
    return tweet.entities.user_mentions;
  }

  /**
   * Construct a tweet like hashtag + sentence + friend
   *
   * @param hashtag
   * @param friend
   */
  private constructTweet(hashtag: string, friend: string) {
    let responses = REPLYDATA;
    let randomResponseIndex = getRandomArbitrary(0, responses.length - 1);
    let randomResponse = responses[randomResponseIndex];
    return `#${hashtag} ${randomResponse} @${friend} `;
  }

  /**
   * Make like to the target's tweet
   *
   * @param tweet
   *
   */
  private async makeLike(tweet: Status) {
    let tweetId = tweet.id_str;
    await this.twitterClient.tweets
      .favoritesCreate({
        id: tweetId,
      })
      .then((result) => {
        console.log(chalk.green("Liked successfully"));
      })
      .catch((e) => console.log(e));
  }

  /**
   * Make retweet to the target´s tweet
   *
   * @param tweet
   */
  private async makeRetweet(tweet: Status) {
    let tweetId = tweet.id_str;
    await this.twitterClient.tweets
      .statusesRetweetById({
        id: tweetId,
      })
      .then((result) => {
        console.log(chalk.green("Retweeted successfully"));
      })
      .catch((e) => console.log(e));
  }

  /**
   * Reply a tweet with the created tweet in {@Link constructTweet}
   *
   * @param responseTweet the tweet maked from the app
   * @param tweetId the tweet´s id to reply
   */
  private async replyTweet(responseTweet: string, tweetId: string) {
    await this.twitterClient.tweets
      .statusesUpdate({
        status: responseTweet,
        in_reply_to_status_id: tweetId,
        auto_populate_reply_metadata: true,
      })
      .then((result) => {
        console.log(chalk.green("Replyed successfully"));
      })
      .catch((e) => console.log(e));
  }

  /**
   * Follow to all the users in the array of mentions
   *
   * @param mentions Users to follow
   */
  private async followMentions(mentions: string[]) {
    console.log("Starting to follow...");
    let counter: number = 1;
    for await (let user of mentions) {
      await this.twitterClient.accountsAndUsers
        .friendshipsCreate({
          screen_name: user,
        })
        .then((result) => {
          console.log(
            chalk.green(
              `User ${counter} of ${mentions.length} followed successfully`
            )
          );
          counter += 1;
        })
        .catch((e) => console.log(e));
    }
  }

  /**
   * Get a random friend provided on .env
   *
   */
  public getRandomFriend() {
    let friendsArray = process.env.FRIENDS!.split(",");
    let randomFriend = friendsArray[getRandomArbitrary(0, friendsArray.length)];
    console.log(randomFriend);
    return randomFriend;
  }

  /**
   * Get the latest tweet of a target excluding replies and rts
   * @param target
   *
   */
  public async getTweet(target: string) {
    return await this.twitterClient.tweets
      .statusesUserTimeline({
        screen_name: target,
        exclude_replies: true,
        include_rts: false,
        tweet_mode: "extended",
      })
      .then((result) => {
        return result[0];
      }).catch(err => console.log(err))
  }

  /**
   * Execute all the functions to start the process
   *
   * @param qUser
   * @param rtweet
   */
  async participate(qUser: UsersShow, rtweet: any) {
    let user: UsersShow = qUser;
    let tweet: any = rtweet;
    let hashtags: any[] = [];
    let mentions: string[] = [];

    console.log(chalk.yellow(`\nStarting giveaway verification...`));

    if (this.isGiveaway(tweet.full_text.toLowerCase())) {
      console.log(chalk.green("It's a giveaway"));
      console.log(chalk.yellow(`\nChecking if it's retweeted and liked`));

      if (!tweet.retweeted && !tweet.favorited) {
        console.log("Not retweeted or liked");

        hashtags = this.getHashtags(tweet);
        mentions = this.getMentions(tweet);
        await this.makeLike(tweet);
        await this.makeRetweet(tweet);
        await this.followMentions(mentions);
        let responseTweet = this.constructTweet(
          hashtags[0].text,
          this.getRandomFriend()
        );
        await this.replyTweet(responseTweet, tweet.id_str);
      } else {
        console.log("Already been retweeted or bookmarked");
      }
    } else {
      console.log(chalk.red("Its not a giveaway"));
    }
  }
}
