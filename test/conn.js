const mongoose = require('mongoose')
const plugin = require('../src')

require('dotenv').config()

const dsn = process.env.MONGODB || 'mongodb://localhost:27017/mongoose_consistent'

mongoose.Promise = global.Promise

after((done) => {
    mongoose.disconnect(done)
})

mongoose.plugin(plugin)

mongoose.connect(dsn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection
    .once('open', () => console.log('Connected!'))
    .on('error', (error) => {
        console.warn('Error : ', error)
    })
