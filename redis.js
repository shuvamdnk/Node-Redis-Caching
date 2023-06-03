const { createClient } = require('redis');
const { promisify } = require('util')
const client = createClient({
    host: 'localhost',
    port: 6379
});

const GET_ASYNC = promisify(client.get).bind(client)
const SET_ASYNC = promisify(client.set).bind(client)

client.on('connect', () => {
    console.log('Client connected to Redis...');
});

client.on('ready', () => {
    console.log('Client connected to Redis and ready to use...');
});

client.on('error', (err) => {
    console.log(err.message);
});

client.on('end', () => {
    console.log('Client disconnected from Redis');
});

process.on('SIGINT', () => {
    client.quit();
});

// const closeRedisConnection = () => {
//     client.quit((error) => {
//         if (error) {
//             console.error('Error closing Redis connection:', error);
//         } else {
//             console.log('Redis connection closed');
//         }
//     });
// }

// const cacheMiddleware = async(req, res, next) => {
//     const cacheKey = req.originalUrl;
//     console.log(cacheKey);
//     await client.connect();
//     const value = await client.get(cacheKey);
//     if(value){
//         console.log('Hit');
//         res.send(JSON.parse(value));
//         closeRedisConnection();
//         return;
//     }
//     // closeRedisConnection();
//     next();
// };

// const cacheResponseToRedis = async(originalUrl,data) => {
//     try {
//         await client.set(originalUrl,JSON.stringify(data),'EX',60);
//         closeRedisConnection();
//         return true;
//     } catch (error) {
//         closeRedisConnection();
//         return false;
//     }
// }

module.exports = {client, GET_ASYNC, SET_ASYNC};
