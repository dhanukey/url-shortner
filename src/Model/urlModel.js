const mongoose = require('mongoose')

const UrlSchema = new mongoose.Schema({

   
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true

    }, urlCode: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    }
},{timestamps:true})

module.exports = mongoose.model('Url',UrlSchema)