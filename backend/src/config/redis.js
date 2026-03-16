import Redis from "ioredis";
import { env } from "./env.js";

let redis = null;

if (env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN) {
  redis = new Redis(env.UPSTASH_REDIS_URL, {
    password: env.UPSTASH_REDIS_TOKEN,
    maxRetriesPerRequest: 1,
    tls: {},
  });

  redis.on("error", (error) => {
    console.error("Redis connection issue", error.message);
  });
}

export { redis };
