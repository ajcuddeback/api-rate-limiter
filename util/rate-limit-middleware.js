const requestIp = require('request-ip');
const nodeCache = require('node-cache');

const time_in_sec = 10;
const rps = 2;
const msToSec = 1 / 1000;
const timeInMs = time_in_sec * 1000;

const ipCache = new nodeCache({ stdTTL: time_in_sec, deleteOnExpire: false, checkperiod: time_in_sec });

// Create a middleware that will...
const ipMiddleware = (req, res, next) => {
    // Get the user's IP
    const clientIp = requestIp.getClientIp(req);
    // Set the users IP to the cache in an array of time stamps
    updateCache(clientIp);
    
    // Get the user's array of time stamps
    const timeStampArr = ipCache.get(clientIp)
    // Compare the total elapased time between time stamps, divided by the length of the array, and convert it to seconds by the given Request per second limit
    if(timeStampArr.length > 1) {
        const clientRPS = timeStampArr.length / ((timeStampArr[timeStampArr.length - 1] - timeStampArr[0]) * msToSec);

        if(clientRPS > rps) {
            console.log('Too Many Requests!');
            return res.status(400).json({"message": "You exceeded the amount of request available in a given second"});
        }
    }

    next();
}

const updateCache = (clientIp) => {
    // Get the time stamp array if it exists
    const timeStampArr = ipCache.get(clientIp) || [];

    // Push the current Date to the array
    timeStampArr.push(new Date());

    // Set the client IP's timestamp array in the cache along with either the current ttl minus the current time, or 10 seconds
    ipCache.set(clientIp, timeStampArr, (ipCache.getTtl(clientIp) - Date.now()) * msToSec || time_in_sec);
}

// We need to handle the expiring our selves, as the node-cache will just delete the entire array on expire
ipCache.on("expired", (key, value) => {
    // If the last item in the array's time minus now, is greater than 10 seconds, delete the array.
    if(new Date() - value[value.length - 1] > timeInMs) {
        ipCache.del(key);
    } else {
        // Filter out all timestamps that have gone over 10 seconds in the array. 
        const updatedTimestampArr = value.filter(timestamp => {
            return new Date() - timestamp < timeInMs;
        });

        // Set the new array with the TTL of 10 seconds, minues the time now minus the first item of the array. 
        ipCache.set(key, updatedTimestampArr, time_in_sec - (new Date() - updatedTimestampArr[0]) * msToSec);
    }
})

module.exports = ipMiddleware;
