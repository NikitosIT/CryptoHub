import { redis } from "../../shared/config/redis.js";
import { AppError } from "../../shared/utils/AppError.js";

export const checkPinAttempts = async (userId: string) => {
    const blockKey = `pin:block:${userId}`;
   
    const ttl = await redis.ttl(blockKey)

    if(ttl > 0){
         throw new AppError(`Too many attempts. Try again after ${ttl} seconds`);
    }
}

export const registerFailedPin = async (userId: string) => {
     const blockKey = `pin:block:${userId}`;
        const failKey = `pin:fail:${userId}`;
     const attempts = await redis.incr(failKey);

     if(attempts >= 3) {
       await redis.set(blockKey, "blocked", {
        expiration: {
            type: "EX",
            value: 300
        }
});
         await redis.del(failKey);
     }
}

export const resetPinAttempts = async (userId: string) => {
    await redis.del(`pin:fail:${userId}`)
}