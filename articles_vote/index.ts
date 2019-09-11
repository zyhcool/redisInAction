
import { RedisClient } from "redis"
import { redisClient } from "../app";

const vote = (redisClient: RedisClient, articleId: string, userId: string) => {
    redisClient.sadd(`voted:${articleId}`, userId);
    redisClient.hincrby(`article|${articleId}`, "votes", 1);
    redisClient.zincrby("votes",1,articleId);
}

const downVote = (redisClient: RedisClient, articleId: string, userId: string) => {
    redisClient.srem(`voted:${articleId}`, userId);
    redisClient.hincrby(`article|${articleId}`, "votes", -1);

}

vote(redisClient,"10001","user_1");
redisClient.hgetall("article|10001",(err,v)=>{
    console.log(v)
})

// 查看分数
redisClient.zrangebyscore("votes",1,10,(err,v)=>{
    console.log(v)
})