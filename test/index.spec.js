const { assert } = require('chai')

const {
    createTagAndProduct,
    createAuthorsAndPosts,
    createProductAndDatasheetComment
} = require('./helpers')

const {
    Author,
    Post,
    Product,
    Comment,
    Tag
} = require('./models')

describe('remove parent with nested document', () => {
    it('target mapping is property.refPath', (done) => {
        // Create product with datasheet (sudocument/subschema)
        // Create comment with target refPath (Product.datasheet)
        // Attempt remove product
        // Expect error Comment.target

        Comment.schema.paths.target.options.onDelete = 'restrict'

        createProductAndDatasheetComment(done).then(({ product, comment }) => {
            assert.equal(comment.target, product.datasheet._id)

            let message = null
            product
                .delete()
                .catch((error) => {
                    message = error.message
                }).finally(() => {
                    assert.isNotNull(message)
                    assert.equal(message, 'Cannot delete a parent doc: ref constraint fails (Comment.target)')
                    done()
                })
        })
    })
})

describe('remove multiple parent document', () => {
    it('actionType: restrict', (done) => {
        Post.schema.paths.author.options.onDelete = 'restrict'

        createAuthorsAndPosts(done).then(({ authors }) => {
            const authorIds = authors.map(author => author._id)

            let errorMessage = null
            Author.deleteMany({
                _id: { $in: authorIds }
            })
            .catch((err) => {
                errorMessage = err.message
            }).finally(() => {
                assert.equal(errorMessage, 'Cannot delete a parent doc: ref constraint fails (Post.author)')
                done()
            })
        })
    })

    it('actionType: cascade', (done) => {
        Post.schema.paths.author.options.onDelete = 'cascade'

        createAuthorsAndPosts(done).then(({ authors, posts }) => {
            const authorIds = authors.map(author => author._id)

            Author.deleteMany({
                _id: { $in: authorIds }
            })
            .then(() => {
                const postIds = posts.map(post => post._id)
                Post.find({ _id: { $in: postIds } }).then((posts) => {
                    assert.isEmpty(posts)
                    done()
                })
            })
        })
    })

    it('actionType: set_null', (done) => {
        Post.schema.paths.author.options.onDelete = 'set_null'

        createAuthorsAndPosts(done).then(({ authors, posts }) => {
            const authorIds = authors.map(author => author._id)
            const beforeLength = posts.length

            Author
                .deleteMany({
                    _id: { $in: authorIds }
                })
                .then(() => {
                    const postIds = posts.map(post => post._id)
                    Post.find({ _id: { $in: postIds } }).then((posts) => {
                        assert.equal(posts.length, beforeLength)
                        for (const post of posts) {
                            assert.isNull(post.author)
                        }
                        done()
                    })
                })
        })
    })
})

describe('with array of ObjectId(s)', () => {
    it('actionType: cascade', (done) => {
        // Create tags
        // Create product with tags
        // Attempt remove tags
        // Expect product is removed

        Product.schema.paths.tags.options.type[0].onDelete = 'cascade'

        createTagAndProduct(done).then(({ tag, product}) => {
            assert.equal(product.tags.length, 1)
            assert.equal(product.tags[0], tag._id)

            tag
                .delete()
                .finally(() => {
                    Tag.findById(tag._id).then((tag) => {
                        assert.isNull(tag)
                        Product.findById(product._id).then((product) => {
                            assert.isNull(product)
                            done()
                        })
                    })
                })
        })
    })

    it('actionType: set_null', (done) => {
        // Create tags
        // Create product with tags
        // Attempt remove tags
        // Expect tag ObjectID is removed from product

        Product.schema.paths.tags.options.type[0].onDelete = 'set_null'

        createTagAndProduct(done).then(({ tag, product }) => {
            assert.equal(product.tags.length, 1)
            assert.equal(product.tags[0], tag._id)

            tag
                .delete()
                .finally(() => {
                    Tag.findById(tag._id).then((tag) => {
                        assert.isNull(tag)
                        Product.findById(product._id).then((product) => {
                            assert.equal(product.tags.length, 0)
                            done()
                        })
                    })
                })
        })
    })
})
