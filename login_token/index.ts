import { redisClient } from "../app";

const HashTitle = "tokens";

const storeToken = (userId: string, token: string) => {
    redisClient.hset(HashTitle, token, userId);
}

const checkToken = (token: string) => {
    redisClient.hget(HashTitle, token, (err, v) => {
        if (v) {
            console.log(`token有效：${v}`);
        } else {
            console.log("token 无效");
        }
    })
}

const updateToken = (token: string, userId: string, itemId?: string) => {
    const time = new Date().getTime();
    redisClient.hset(HashTitle, token, userId);
    redisClient.zadd("recents", token, time);
    if (itemId) {
        redisClient.zadd("views|" + token, itemId, time);
        redisClient.zremrangebyrank("views|"+token,0,-26);
    }
}

