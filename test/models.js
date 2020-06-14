const mongoose = require('mongoose')
const plugin = require('../src')

require('dotenv').config()

mongoose.Promise = global.Promise

mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection
    .once('open', () => console.log('Connected!'))
    .on('error', (error) => {
        console.warn('Error : ', error)
    })

mongoose.plugin(plugin, {
    // actionDefault: 'restrict'
})

const {
    AuthorSchema,
    PostSchema,
    ProductSchema,
    CommentSchema,
    TagSchema
} = require('./schemas')

const Author = mongoose.model('Author', AuthorSchema)
const Post = mongoose.model('Post', PostSchema)
const Product = mongoose.model('Product', ProductSchema)
const Comment = mongoose.model('Comment', CommentSchema)
const Tag = mongoose.model('Tag', TagSchema)

module.exports = {
    Author,
    AuthorSchema,
    Post,
    PostSchema,
    Product,
    ProductSchema,
    Comment,
    CommentSchema,
    Tag,
    TagSchema
}
