const { assert } = require('chai')

const {
    createAuthorAndPost,
    createTagAndProduct,
    createProductAndBenchmark,
    createProductsAndDatasheetPool
} = require('./helpers')

const {
    Post,
    Product,
    Tag,
    Benchmark,
    DatasheetPool
} = require('./models')

describe('set_null action', () => {
    it('direct ref mapping between models', (done) => {
        // Post.author
        // Create author
        // Create post for author
        // Attempt remove author
        // Expect Post.author be updated to null

        Post.schema.paths.author.options.onDelete = 'set_null'

        createAuthorAndPost(done).then(({ author, post }) => {
            author
                .delete()
                .finally(() => {
                    Post.findById(post).then((post) => {
                        assert.isNull(post.author)
                        done()
                    })
                })
        })
    })

    it('array of ObjectIDs mapping', (done) => {
        // Product.tags
        // Create tags
        // Create product with tags
        // Attempt remove tags
        // Expect ObjectIDs from Product.tags is removed

        Product.schema.paths.tags.options.type[0].onDelete = 'set_null'

        createTagAndProduct(done).then(({ tag, product }) => {
            tag
                .delete()
                .finally(() => {
                    Tag.findById(tag._id).then((tag) => {
                        assert.isNull(tag) // Tag is removed

                        Product.findById(product._id).then((product) => {
                            assert.equal(product.tags.length, 0) // Product.tags is cleared
                            done()
                        })
                    })
                })
        })
    })

    it('subdocument (subSchema) ref to another model', (done) => {
        // Benchmark.datasheet ref Product.datasheet
        // Create product with datasheet (subDocument/subSchema)
        // Create benchmark with datasheet ref (Product.datasheet)
        // Attempt remove product
        // Expect Benchmark.datasheet be updated to null

        Benchmark.schema.paths.datasheet.options.onDelete = 'set_null'

        createProductAndBenchmark(done).then(({ product, benchmark }) => {
            assert.equal(benchmark.datasheet._id, product.datasheet._id)
            product
                .delete()
                .finally(() => {
                    Benchmark.findById(benchmark._id).then((benchmark) => {
                        assert.isNull(benchmark.datasheet)
                        done()
                    })
                })
        })
    })

    it('array of ObjectIDs ref to sudocument(subSchema)', (done) => {
        // DatasheetPool.history is array of ObjectIDs from Product.datasheet
        // Create various products with datasheet
        // Extract list of datasheets from products
        // Create datasheet pool with list of datasheets
        // Attempt remove one of product
        // One ObjectID of Product.history is removed

        DatasheetPool.schema.paths.history.options.type[0].onDelete = 'set_null'

        createProductsAndDatasheetPool(done).then(({ products, pool }) => {
            const product = products[1]

            product
                .delete()
                .finally(() => {
                    DatasheetPool.findById(pool._id).then((pool) => {
                        assert.equal(pool.history.length, 2)
                        done()
                    })
                })
        })
    })
})
