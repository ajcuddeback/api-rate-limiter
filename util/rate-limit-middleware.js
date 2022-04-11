const requestIp = require('request-ip');
const nodeCache = require('node-cache');

const time_in_sec = 10;
const rps = 2;
const msToSec = 1 / 1000;

const ipCache = new nodeCache({ stdTTL: time_in_sec, checkperiod: time_in_sec });

// Create a middleware that will...
const ipMiddleware = (req, res, next) => {
    // Get the user's IP
    const clientIp = requestIp.getClientIp(req);
    // Set the users IP to the cache in an array of time stamps
    updateCache(clientIp);
    
    // Get the user's array of time stamps
    const timeStampArr = ipCache.get(clientIp)
    // Compare the total elapased time between time stamps, divided by the length of the array, and convert it to seconds by the given Request per second limit
    const clientRPS = timeStampArr.length / ((timeStampArr[timeStampArr.length - 1] - timeStampArr[0]) * msToSec);

    if(clientRPS > rps) {
        console.log('Too Many Requests!');
        res.sendStatus(400).end();
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
