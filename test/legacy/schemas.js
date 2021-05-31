const mongoose = require('mongoose')

/**
 * Post.author
 */
const AuthorSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String
}, { timestamps: true })

/**
 * Product.tags (array of ObjectIds)
 */
const TagSchema = new mongoose.Schema({
    name: String,
}, { timestamps: true })

/**
 * Comment.target && Comment.forModel === 'Post
 */
const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'Author',
        onDelete: 'restrict'
    }
}, { timestamps: true })

/**
 * Product.datasheet
 */
const DataSheetSchema = new mongoose.Schema({
    power: Number,
    weight: Number,
    width: Number,
    height: Number
}, { timestamps: true })

/**
 * Comment.target && Comment.forModel === 'Product'
 */
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    tags: [{
        type: mongoose.Types.ObjectId,
        ref: 'Tag',
        onDelete: 'restrict'
    }],
    datasheet: DataSheetSchema
    // variations: array of subdocs
}, { timestamps: true })

const ProductReviewSchema = new mongoose.Schema({
    content: String,
    stars: Number,
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    }
}, { timestamps: true })

const BenchmarkSchema = new mongoose.Schema({
    result: Number,
    datasheet: {
        type: mongoose.Types.ObjectId,
        ref: 'Product.datasheet',
        onDelete: 'restrict'
    }
})

const DatasheetPoolSchema = new mongoose.Schema({
    history: [{
        type: mongoose.Types.ObjectId,
        ref: 'Product.datasheet',
        onDelete: 'restrict'
    }]
}, { timestamps: true })

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
        enum: ['Post', 'Product', 'Product.datasheet']
    }
})

module.exports = {
    AuthorSchema,
    PostSchema,
    ProductSchema,
    CommentSchema,
    TagSchema,
    DataSheetSchema,
    DatasheetPoolSchema,
    BenchmarkSchema,
    ProductReviewSchema
}
