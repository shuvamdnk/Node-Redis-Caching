const express = require('express')
const axios = require('axios')
const { createClient } = require('redis')
const responseTime = require('response-time')
const app = express()
app.use(responseTime())

const client = createClient({
    password: 'ki5zzmf2oSPOqO4XA3rnzfWlbTn7OaTt',
    socket: {
        host: 'redis-15271.c9.us-east-1-2.ec2.cloud.redislabs.com',
        port: 15271
    }
});

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

// process.on('SIGINT', () => {
//     client.quit();
// });


// creating middleware
const cacheFromRedis = async (req,res,next) => {
    const key = req.originalUrl;
    // connect to redis
    await client.connect();
    // get data from redis
    const value = await client.get(key);
    
    if (value) {
        console.log('HIT');
        // res.setHeader('X-Cache', 'hit');
        await client.disconnect();
        return res.json(JSON.parse(value));
    }
    next();
}

const cacheToRedis = async(key,value) => {
    // console.log(value);
    // await client.connect();
    const resp = await client.set(key, JSON.stringify(value),'EX',6000); // caching will be expired after 60s
    await client.disconnect();
    console.log('MISS');
    return resp;
}

app.use(cacheFromRedis);

app.get('/',async(req,res,next) => {
    // await client.connect();

    // console.log(client.isReady());
    // console.log(client.isOpen());
    // await client.set('name', 'shuvam','EX',5);
    // const value = await client.get('name');
    // console.log(value); // returns 'bar'
    // await client.disconnect();
    // res.send({
    //     message:"success"
    // });

    try {
        const key = req.originalUrl;
        // const apiRes = await axios.get(`https://mobileadmin.nybizz.com/api/customer/popular`);
        // const data = apiRes.data
        const respone = await axios.get('https://api.spacexdata.com/v3/rockets')
        // console.log();
        // const data = {
        //     message: 'Hi'
        // }
        // console.log('inside fun');
        const resp = await cacheToRedis(key,respone.data);
        console.log(resp);
        // const end = process.hrtime(res.locals.start); // Calculate the elapsed time
        // const responseTimeInMs = (end[0] * 1000 + end[1] / 1000000).toFixed(2); // Convert to milliseconds and format
        // Include the response time in the response body
        // data.responseTime = responseTimeInMs;
        res.status(200).send(respone.data)
    } catch (error) {
        console.log(error);
        res.send('error')
    }
})




// const client = redis.createClient({
//   host: '127.0.0.1',
//   port: 6379,
// })
// const GET_ASYNC = promisify(client.get).bind(client)
// const SET_ASYNC = promisify(client.set).bind(client)

// app.get('/rockets', async (req, res, next) => {
//   try {
//     const reply = await GET_ASYNC('rockets')
//     if (reply) {
//       console.log('using cached data')
//       res.send(JSON.parse(reply))
//       return
//     }
//     const respone = await axios.get('https://api.spacexdata.com/v3/rockets')
//     const saveResult = await SET_ASYNC(
//       'rockets',
//       JSON.stringify(respone.data),
//       'EX',
//       5
//     )
//     console.log('new data cached', saveResult)
//     res.send(respone.data)
//   } catch (error) {
//     res.send(error.message)
//   }
// })

// app.get('/rockets/:rocket_id', async (req, res, next) => {
//   try {
//     const { rocket_id } = req.params
//     const reply = await GET_ASYNC(rocket_id)
//     if (reply) {
//       console.log('using cached data')
//       res.send(JSON.parse(reply))
//       return
//     }
//     const respone = await axios.get(
//       `https://api.spacexdata.com/v3/rockets/${rocket_id}`
//     )
//     const saveResult = await SET_ASYNC(
//       rocket_id,
//       JSON.stringify(respone.data),
//       'EX',
//       5
//     )
//     console.log('new data cached', saveResult)
//     res.send(respone.data)
//   } catch (error) {
//     res.send(error.message)
//   }
// })

app.listen(3000, () => console.log('on port 3000'))
