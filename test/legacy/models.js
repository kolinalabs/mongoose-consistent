const mongoose = require('mongoose')

const {
    AuthorSchema,
    PostSchema,
    ProductSchema,
    CommentSchema,
    TagSchema,
    BenchmarkSchema,
    ProductReviewSchema,
    DatasheetPoolSchema
} = require('./schemas')

const Author = mongoose.model('Author', AuthorSchema)
const Post = mongoose.model('Post', PostSchema)
const Product = mongoose.model('Product', ProductSchema)
const ProductReview = mongoose.model('ProductReview', ProductReviewSchema)
const Comment = mongoose.model('Comment', CommentSchema)
const Tag = mongoose.model('Tag', TagSchema)
const Benchmark = mongoose.model('Benchmark', BenchmarkSchema)
const DatasheetPool = mongoose.model('DatasheetPool', DatasheetPoolSchema)

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
    TagSchema,
    Benchmark,
    ProductReview,
    DatasheetPool
}
