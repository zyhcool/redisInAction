import { redisClient } from "../app";
import { createHash } from "crypto";

// tokens and userIds
const HashTitle = "tokens";
// recent login-in tokens
const RECENT = "recents";
// views of items
const VIEWS = "views";

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
    redisClient.zadd(RECENT, token, time);
    if (itemId) {
        redisClient.zadd(VIEWS + "|" + token, itemId, time);
        redisClient.zremrangebyrank(VIEWS + "|" + token, 0, -26);
    }
}

const cleanToken = () => {
    redisClient.zcard(RECENT, (err, size) => {
        if (size <= 10 * 5) {
            return;
        } else {
            redisClient.zrange(RECENT, 0, 100, (err, value) => {
                const views_tokens = value.map((token) => {
                    return `${VIEWS}|${token}`;
                });
                const cart_tokens = value.map((token) => {
                    return `${CART}|${token}`;
                })
                redisClient.del([...views_tokens, ...cart_tokens]);
                redisClient.zrem(RECENT, value);
                redisClient.hdel(HashTitle, value);
            })
        }
    });
}


const CART = "carts";
// shopping cart
const addItemToCart = (token: string, itemId: string, num: number) => {
    redisClient.hset(CART + "|" + token, itemId, `${num}`);
}

const REQUESTCACHE = "requestCache";

const cacheRequest = (request: string, cb) => {
    const requestKey = REQUESTCACHE + createHash("sha256").update(JSON.stringify(request));
    redisClient.get(requestKey, (err, value) => {
        if (!value) {
            const content = cb(request);
            redisClient.setex(REQUESTCACHE, 300000, content);
        }
    });
}

const DELAY = "delay";
const SCHEDULE = "schedule";

const rowCacheDelay = (id: string, delay: number) => {
    redisClient.zadd(DELAY, delay);
    redisClient.zadd(SCHEDULE, id, new Date().getTime());
}

const cacheRows = () => {
    let end = false;
    while (!end) {
        redisClient.zrange(SCHEDULE, 0, 0, (err, value) => {
            const id = value[0];
            redisClient.zscore(DELAY, id, (err, value) => {
                if (Number.parseInt(value, 10) <= 0) {
                    redisClient.zrem(DELAY, id);
                    redisClient.zrem(SCHEDULE, id);
                    redisClient.del("rows:" + id);
                }
            })
        })
    }
}

redisClient.persist