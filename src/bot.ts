import { StatusesUserTimeline, TwitterClient } from "twitter-api-client";
import TweetsClient from "twitter-api-client/dist/clients/TweetsClient";
import UsersShow, {
  Status,
} from "twitter-api-client/dist/interfaces/types/UsersShowTypes";
import { REPLYDATA } from "./core/data/reply.data";
import { KEYWORDSDATA } from "./core/data/sentences.data";
import { getRandomArbitrary } from "./core/functions/functions";

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
   * Funcion que a partir de un nombre de usuario consigue su ultimo tweet
   *
   */
  async getUser(): Promise<UsersShow> {
    let data = await this.twitterClient.accountsAndUsers.usersShow({
      screen_name: this.targetUsername,
    });
    return Promise.resolve(data);
  }

  /**
   * Funcion que considera si el tweet es un sorteo
   * @param tweet
   */
  private isRaffle(tweet: string): boolean {
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
   * Función que devuelve el hashtag si es un sorteo
   * @param tweet
   */
  private getRaffleHashtag(tweet: any): string[] {
    return tweet.entities.hashtags;
  }

  private getMentions(tweet: any) {
    return tweet.entities.user_mentions;
  }

  private constructTweet(hashtag: string, friend: string) {
    let responses = REPLYDATA;
    let randomResponseIndex = getRandomArbitrary(0, responses.length - 1);
    let randomResponse = responses[randomResponseIndex];
    return `#${hashtag} ${randomResponse} @${friend} `;
  }

  private async makeLike(tweet: Status) {
    let tweetId = tweet.id_str;
    await this.twitterClient.tweets
      .favoritesCreate({
        id: tweetId,
      })
      .then((result) => {
        console.log("Marcado con like con exito");
      })
      .catch((e) => console.log(e));
  }

  private async makeRetweet(tweet: Status) {
    let tweetId = tweet.id_str;
    await this.twitterClient.tweets
      .statusesRetweetById({
        id: tweetId,
      })
      .then((result) => {
        console.log("Retweet hecho con exito");
      })
      .catch((e) => console.log(e));
  }

  private async replyTweet(responseTweet: string, tweetId: string) {
    await this.twitterClient.tweets
      .statusesUpdate({
        status: responseTweet,
        in_reply_to_status_id: tweetId,
        auto_populate_reply_metadata: true,
      })
      .then((result) => {
        console.log("Reply hecho con exito");
      })
      .catch((e) => console.log(e));
  }

  private async followMentions(mentions: string[]) {
    console.log("Comenzando a seguir");
    let counter: number = 1;
    for await (let user of mentions) {
      await this.twitterClient.accountsAndUsers
        .friendshipsCreate({
          screen_name: user,
        })
        .then((result) => {
          console.log(
            `Usuario ${counter} de ${mentions.length} seguido con exito`
          );
          counter += 1;
        })
        .catch((e) => console.log(e));
    }
  }

  public getRandomFriend() {
    let friendsArray = process.env.FRIENDS!.split(",");
    let randomFriend = friendsArray[getRandomArbitrary(0, friendsArray.length)];
    console.log(randomFriend);
    return randomFriend;
  }

  public async getTweet(target: string): Promise<StatusesUserTimeline> {
    return await this.twitterClient.tweets
      .statusesUserTimeline({
        screen_name: target,
        count: 1,
        exclude_replies: true,
        include_rts: false,
        tweet_mode: "extended",
      })
      .then((result) => {
        return result[0];
      });
  }

  async participate(qUser: UsersShow, rtweet: any) {
    let user: UsersShow = qUser;
    let tweet: any = rtweet;
    let hashtags: any[] = [];
    let mentions: string[] = [];

    console.log("\n--------------------------------------");
    console.log("\nSe inicia comprobación si es un sorteo");

    //Si esto es un sorteo
    if (this.isRaffle(tweet.full_text.toLowerCase())) {
      console.log("Es un sorteo");
      console.log("\n--------------------------------------");
      console.log("\nComprobando si esta retwiteado y marcado como favorito");

      if (!tweet.retweeted && !tweet.favorited) {
        console.log("No esta retwiteado o marcado como favorito");

        hashtags = this.getRaffleHashtag(tweet);
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
        console.log("Ya ha sido retwitteado o marcado como favorito");
      }
    } else {
      console.log("No es un sorteo");
    }
  }
}
