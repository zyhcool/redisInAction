import { redisClient } from "../app";

const initData = function () {
    const articles = [
        {
            id: "10001",
            title: "a1",
            votes: 0,
        },
        {
            id: "10002",
            title: "a2",
            votes: 0,
        },
        {
            id: "10003",
            title: "a3",
            votes: 0,
        },
        {
            id: "10004",
            title: "a4",
            votes: 0,
        },
        {
            id: "10005",
            title: "a5",
            votes: 0,
        },
        {
            id: "10006",
            title: "a6",
            votes: 0,
        }
    ];
    articles.forEach((article, index) => {
        redisClient.hset(`article|${article.id}`,"title",article.title);
        redisClient.hset(`article|${article.id}`,"votes",`${article.votes}`);
        redisClient.zadd(`votes`,article.votes,article.id);
    })
}
initData();
console.log("init articles data");

