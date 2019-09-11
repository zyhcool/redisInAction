import * as redis from "redis";


export const redisClient = redis.createClient(6379, "127.0.0.1");

