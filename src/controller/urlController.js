
const urlModel = require("../model/urlModel")
const validUrl = require('valid-url');
const shortid = require('shortid');
const redis = require("redis");

const baseUrl = 'http://localhost:3000'

/*******************************Redis Connection**********************************/

const { promisify } = require("util"); // error first call back is converted to promise 

//Connect to redis
const redisClient = redis.createClient(
  13190,   //port
  "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com", //host
  { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

/*******************************Create Shorten Url **********************************/


const CreateShortUrl = async function (req, res) {
    try {
        let body = req.body
        // let longUrl = body.longUrl

        // Validation 
        if (Object.keys(body).length === 0) {
            return res.status(400).send({ status: false, message: "Please enter the data" })
        }
        // Checking Url is valid or not 
        if (!body.longUrl) {
            return res.status(400).send({ status: false, message: "Please enter the URL" })
        }

        //  Checking url using validUrl package 

        if (!validUrl.isUri(body.longUrl)) {

            // console.log('Looks like not a valid URL');
            return res.status(400).send({ status: false, message: "Looks like not a valid URL" })
        }

        let longUrl= body.longUrl

        

        let checkforUrl = await GET_ASYNC(`${longUrl}`)
        if (checkforUrl) {

            console.log("aarey yeh toh redis se aayaa hai")
            return res.status(200).send({ status: true, "data": JSON.parse(checkforUrl) })
        }

    
        let FindUrl = await urlModel.findOne({ longUrl: body.longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })

        if (FindUrl) {

            console.log("Hiii")

            return res.status(201).send({ Status: true, data: FindUrl })
        }
            // shortid generated 
        const urlCode = shortid.generate().toLowerCase()
        let shortUrl = baseUrl + '/' + urlCode

            url = { longUrl, shortUrl, urlCode }
    
            //  create url in db

        let ShortUrlCreate= await urlModel.create(url)


        //  setting key and value pair

        await SET_ASYNC(`${shortUrl}`, `${longUrl}`)

        await SET_ASYNC(`${longUrl}`, JSON.stringify(url))


        // let ShowUrl = await urlModel.findOne({ longUrl: body.longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })

        // return res.status(201).send({ Status: true, data: ShowUrl })
       
  
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

/*******************************Get Url**********************************/


const getUrl = async function (req, res) {
    try {
        // url which comes in params 
        let urlCode = req.params.urlCode

        // console.log(`${baseUrl}/${req.params.urlCode}`)

        let cachedProfileData = await GET_ASYNC(`${baseUrl}/${req.params.urlCode}`)
        
        // console.log(cahcedProfileData)
        
        if(cachedProfileData) {
            // console.log('Hii Nikhil Dhanukey')
     return res.redirect(cachedProfileData) 
          
        }

        // find urlCode in db 
        
        let url = await urlModel.findOne({ urlCode: urlCode });

        if (!url) {
            return res.status(404).send({ status: false, message: 'url not found' })
        }
       return res.status(303).redirect(url.longUrl)// 303 redirection status
    }
    catch (error) { res.status(500).send({ status: false, message: error.message }) }
}


module.exports = { CreateShortUrl, getUrl }