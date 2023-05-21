const express = require("express");
const app = express();
const NodeCache = require('node-cache');
const cache = new NodeCache();
const axios = require('axios');
// const {client, closeRedisConnection, cacheMiddleware, cacheResponseToRedis} = require('./redis');


function cacheMiddleware(req, res, next) {
    const key = req.originalUrl;
    console.log(cache.getStats());
    console.log(cache.keys());
    // Check if cached response exists
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
        console.log('HIT');
        res.setHeader('X-Cache', 'hit');
        return res.json(JSON.parse(cachedResponse));
    }

    // Cache the response after the route handler finishes
    const originalSend = res.send;
    res.send = function (data) {
        console.log('MISS');
        res.setHeader('X-Cache', 'miss');
        cache.set(key, data, 3600); // caching will be expired after 60s
        originalSend.apply(res, arguments);
    };

    next();
}


app.use(cacheMiddleware);
app.use((req, res, next) => {
    const start = process.hrtime(); // Capture the start time of the request
    res.locals.start = start; // Store the start time in res.locals
    next();
});

app.get('/', async (req, res, next) => {
    try {
        // const apiRes = await axios.get(`https://mobileadmin.nybizz.com/api/customer/popular`);
        // const data = apiRes.data
        const data = {
            message: 'Hi'
        }
        const end = process.hrtime(res.locals.start); // Calculate the elapsed time
        const responseTimeInMs = (end[0] * 1000 + end[1] / 1000000).toFixed(2); // Convert to milliseconds and format
        // Include the response time in the response body
        data.responseTime = responseTimeInMs;
        res.status(200).send(data)
    } catch (error) {
        console.log(error);
        res.send('error')
    }
});




// Define your API routes
// app.get('/api', async (req, res) => {
//     try {
//         const originalUrl = req.originalUrl;
//         // const apiRes = await axios.get(`https://mobileadmin.nybizz.com/api/customer/popular`);
//         // const data = apiRes.data;
//         const data = {
//             message:'Hi'
//         }
//         if(cacheResponseToRedis(originalUrl,data)){
//             console.log('Miss');
//             return res.send(data);
//         }else{
//             throw new Error('Error');
//         }
//     } catch (error) {
//         closeRedisConnection();
//         console.log(error);
//     }
// });


app.listen(5000, () => {
    console.log('Server started at port 5000');
})
