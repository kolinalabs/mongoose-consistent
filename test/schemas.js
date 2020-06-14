const mongoose = require('mongoose')

const AuthorSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String
}, { timestamps: true })

const TagSchema = new mongoose.Schema({
    name: String,
}, { timestamps: true })

const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'Author',
        onDelete: 'restrict'
    }
}, { timestamps: true })

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    tags: [{
        type: mongoose.Types.ObjectId,
        ref: 'Tag',
        onDelete: 'restrict'
    }]
})

const CommentSchema = new mongoose.Schema({
    body: String,
    target: {
        type: mongoose.Types.ObjectId,
        required: true,
        refPath: 'forModel',
        onDelete: 'restrict'
    },
    forModel: {
        type: String,
        required: true,
        enum: ['Post', 'Product']
    }
})

module.exports = {
    AuthorSchema,
    PostSchema,
    ProductSchema,
    CommentSchema,
    TagSchema
}
