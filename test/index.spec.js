const { assert } = require('chai')

const {
    Author,
    Post,
    Product,
    Comment,
    Tag
} = require('./models')

const {
    makeAuthorData,
    makePostData
} = require('./helpers')

beforeEach(async () => {
    await Comment.deleteMany({})
    await Product.deleteMany({})
    await Post.deleteMany({})
    await Author.deleteMany({})
    await Tag.deleteMany({})
})

describe('remove single parent document', () => {
    it('actionType: restrict', (done) => {
        Author.create(makeAuthorData()).then((author) => {
            Post.create(makePostData(author)).then(() => {
                let errorMessage = null
                author.delete().then(() => {
                }).catch((err) => {
                    errorMessage = err.message
                }).finally(() => {
                    assert.equal(errorMessage, 'Cannot delete a parent doc: ref constraint fails (Post.author)')
                    done()
                })
            })
        })
    })

    it('actionType: cascade', (done) => {
        Post.schema.paths.author.options.onDelete = 'cascade'

        Author.create(makeAuthorData()).then((author) => {
            Post.create(makePostData(author)).then((post) => {
                author.delete()
                    .then(() => {
                    }).catch(() => {
                        throw new Error('Fail expected promise behavior')
                    }).finally(() => {
                        Post.findById(post._id).then(post => {
                            assert.isNull(post)
                            done()
                        })
                    })
            })
        })
    })

    it('actionType: set_null', (done) => {
        Post.schema.paths.author.options.onDelete = 'set_null'

        Author.create(makeAuthorData()).then((author) => {
            Post.create(makePostData(author)).then((post) => {
                author.delete()
                    .then(() => {
                    }).catch(() => {
                        throw new Error('Fail expected promise behavior')
                    }).finally(() => {
                        Post.findById(post._id).then(post => {
                            assert.isNull(post.author)
                            done()
                        })
                    })
            })
        })
    })
})

describe('remove multiple parent document', () => {
    it('actionType: restrict', (done) => {
        Post.schema.paths.author.options.onDelete = 'restrict'
        const data = makeAuthorData(2)

        Author.insertMany(data).then((authors) => {
            assert.equal(authors.length, data.length)

            const postsData = []
            for (const author of authors) {
                postsData.push(makePostData(author))
            }

            Post.insertMany(postsData).then((posts) => {
                assert.equal(posts.length, data.length)

                const authorIds = authors.map(author => author._id)

                let errorMessage = null
                Author.deleteMany({
                    _id: { $in: authorIds }
                }).then(() => {

                }).catch((err) => {
                    errorMessage = err.message
                }).finally(() => {
                    assert.equal(errorMessage, 'Cannot delete a parent doc: ref constraint fails (Post.author)')
                    done()
                })
            })
        })
    })

    it('actionType: cascade', (done) => {
        Post.schema.paths.author.options.onDelete = 'cascade'

        const data = makeAuthorData(2)

        Author.insertMany(data).then((authors) => {
            assert.equal(authors.length, data.length)

            const postsData = []
            for (const author of authors) {
                postsData.push(makePostData(author))
            }

            Post.insertMany(postsData).then((posts) => {
                assert.equal(posts.length, data.length)

                const authorIds = authors.map(author => author._id)

                Author.deleteMany({
                    _id: { $in: authorIds }
                }).then(() => {
                }).catch((err) => {

                }).finally(() => {
                    const postIds = posts.map(post => post._id)
                    Post.find({ _id: { $in: postIds } }).then((posts) => {
                        assert.isEmpty(posts)
                        done()
                    })
                })
            })
        })
    })

    it('actionType: set_null', (done) => {
        Post.schema.paths.author.options.onDelete = 'set_null'

        const data = makeAuthorData(2)

        Author.insertMany(data).then((authors) => {
            assert.equal(authors.length, data.length)

            const postsData = []
            for (const author of authors) {
                postsData.push(makePostData(author))
            }

            Post.insertMany(postsData).then((posts) => {
                assert.equal(posts.length, data.length)

                const authorIds = authors.map(author => author._id)

                Author.deleteMany({
                    _id: { $in: authorIds }
                }).then(() => {
                }).catch((err) => {
                    throw new Error('Fail expected promise behavior')
                }).finally(() => {
                    const postIds = posts.map(post => post._id)
                    Post.find({ _id: { $in: postIds } }).then((posts) => {
                        assert.equal(posts.length, postsData.length)
                        for (const post of posts) {
                            assert.isNull(post.author)
                        }
                        done()
                    })
                })
            })
        })
    })
})

describe('with refPath', () => {
    it('actionType: restrict', (done) => {
        Comment.schema.paths.target.options.onDelete = 'restrict'
        /**
         * Product >> Comment
         * 1. Create product
         * 2. Create comment for product
         * 3. Attempt remove product
         * 4. Expect error
         */

        Product.create({
            name: 'Product A',
            price: 200
        }).then((product) => {
            assert.isNotNull(product.createdAt)

            Comment.create({
                body: 'My test comment',
                target: product._id,
                forModel: 'Product'
            }).then((comment) => {
                assert.isNotNull(comment.createdAt)
                assert.equal(comment.target, product._id)

                let errorMessage = null
                product.delete().then(() => {
                    throw new Error('Fail expected promise behavior')
                }).catch((error) => {
                    errorMessage = error.message
                }).finally(() => {
                    assert.equal(errorMessage, 'Cannot delete a parent doc: ref constraint fails (Comment.target)')

                    // Re-find product
                    Product.findById(product._id).then((product) => {
                        assert.isNotNull(product)
                        done()
                    })
                })
            }).catch((error) => {
                console.error('Invalid promise state on level 2: ', error.message)
                done()
            })
        }).catch((error) => {
            console.error('Invalid promise state on level 1', error.message)
            done()
        })
    })
})

describe('with array of ObjectId(s)', () => {
    it('actionType: restrict', (done) => {
        Product.schema.paths.tags.options.type[0].onDelete = 'restrict'
        /**
         * Tag(s) >> Product
         * 1. Create tags
         * 2. Create product with tags
         * 3. Attempt remove tags
         * 4. Expect error
         */

        Tag.create({
            name: 'my-slugged-tag'
        }).then((tag) => {
            assert.isNotNull(tag.createdAt)

            Product.create({
                name: 'My Product',
                price: 100,
                tags: [tag._id]
            }).then((product) => {
                assert.equal(product.tags.length, 1)
                assert.equal(product.tags[0], tag._id)

                let errorMessage = null
                tag.delete().then(() => {
                    throw new Error('Fail expected promise behavior')
                }).catch((error) => {
                    errorMessage = error.message
                }).finally(() => {
                    assert.equal(errorMessage, 'Cannot delete a parent doc: ref constraint fails (Product.tags)')

                    // Re-find tag
                    Tag.findById(tag._id).then((tag) => {
                        assert.isNotNull(tag)
                        done()
                    })
                })
            })
        })
    })

    it('actionType: cascade', (done) => {
        Product.schema.paths.tags.options.type[0].onDelete = 'cascade'
        /**
         * Tag(s) >> Product
         * 1. Create tags
         * 2. Create product with tags
         * 3. Attempt remove tags
         * 4. Expect error
         */

        Tag.create({
            name: 'my-slugged-tag'
        }).then((tag) => {
            assert.isNotNull(tag.createdAt)

            Product.create({
                name: 'My Product',
                price: 100,
                tags: [tag._id]
            }).then((product) => {
                assert.equal(product.tags.length, 1)
                assert.equal(product.tags[0], tag._id)

                tag.delete().then(() => {
                })
                .catch((error) => {
                }).finally(() => {
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
    })

    it('actionType: set_null', (done) => {
        Product.schema.paths.tags.options.type[0].onDelete = 'set_null'
        /**
         * Tag(s) >> Product
         * 1. Create tags
         * 2. Create product with tags
         * 3. Attempt remove tags
         * 4. Expect error
         */

        Tag.create({
            name: 'my-slugged-tag'
        }).then((tag) => {
            assert.isNotNull(tag.createdAt)

            Product.create({
                name: 'My Product',
                price: 100,
                tags: [tag._id]
            }).then((product) => {
                assert.equal(product.tags.length, 1)
                assert.equal(product.tags[0], tag._id)

                tag.delete().then(() => {
                })
                .catch((error) => {
                }).finally(() => {
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
})
