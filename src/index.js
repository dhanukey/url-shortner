const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = require('./router/router')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect('mongodb+srv://nikhil:borat123@nikhil.9dosz.mongodb.net/Project4?retryWrites=true&w=majority',{
    useNewUrlParser:true
})
.then (() => console.log('mongoDB is connected '))
.catch(err => console.log(err))
app.use("/",router)

app.listen(process.env.PORT || 3000,function(){
    console.log("Express app running on PORT "+(process.env.PORT || 3000))
})

