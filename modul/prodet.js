const mongooes = require('mongoose')

const prodectmdb = new mongooes.Schema({
    title: String,
    image: String
})
const Prodecat = mongooes.model('Prodecat', prodectmdb)

module.exports = Prodecat