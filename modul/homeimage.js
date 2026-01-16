const mongoose = require('mongoose')

const homeimage = new mongoose.Schema({
    image: String
})

const Home = mongoose.model('Home', homeimage)

module.exports = Home;