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

describe('restrict action', () => {
    it('direct ref mapping between models', (done) => {
        // Post.author
        // Create author
        // Create post for author
        // Attempt remove author
        // Expect error Post.author

        Post.schema.paths.author.options.onDelete = 'restrict'

        createAuthorAndPost(done).then(({ author }) => {
            let errorMessage = null
            author
                .delete()
                .catch((err) => {
                    errorMessage = err.message
                })
                .finally(() => {
                    assert.equal(errorMessage, 'Cannot delete a parent doc: ref constraint fails (Post.author)')
                    done()
                })
        })
    })

    it('array of ObjectIDs mapping', (done) => {
        // Product.tags
        // Create tags
        // Create product with tags
        // Attempt remove tags
        // Expect error Product.tags

        Product.schema.paths.tags.options.type[0].onDelete = 'restrict'

        createTagAndProduct(done).then(({ tag }) => {
            let errorMessage = null
            tag
                .delete()
                .catch((error) => {
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

    it('subdocument (subSchema) ref to another model', (done) => {
        // Benchmark.datasheet ref Product.datasheet
        // Create product with datasheet (subDocument/subSchema)
        // Create benchmark with datasheet ref (Product.datasheet)
        // Attempt remove product
        // Expect error Product.datasheet

        Benchmark.schema.paths.datasheet.options.onDelete = 'restrict'

        createProductAndBenchmark(done).then(({ product, benchmark }) => {
            assert.equal(benchmark.datasheet._id, product.datasheet._id)
            let message = null
            product
                .delete()
                .catch((error) => {
                    message = error.message
                })
                .finally(() => {
                    assert.isNotNull(message)
                    assert.equal(message, 'Cannot delete a parent doc: ref constraint fails (Benchmark.datasheet)')
                    done()
                })
        })
    })

    it('array of ObjectIDs ref to sudocument(subSchema)', (done) => {
        // DatasheetPool.history is array of ObjectIDs from Product.datasheet
        // Create various products with datasheet
        // Extract list of datasheets from products
        // Create datasheet pool with list of datasheets
        // Attempt remove one of product
        // Expect error DatasheetPool.history

        DatasheetPool.schema.paths.history.options.type[0].onDelete = 'restrict'

        createProductsAndDatasheetPool(done).then(({ products }) => {
            const product = products[1]

            product
                .delete()
                .catch((error) => {
                    message = error.message
                }).finally(() => {
                    assert.isNotNull(message)
                    assert.equal(message, 'Cannot delete a parent doc: ref constraint fails (DatasheetPool.history)')
                    done()
                })
        })
    })
})
