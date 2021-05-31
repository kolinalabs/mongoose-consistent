require('./conn')

const faker = require('faker')

const {
    Author,
    Post,
    Tag,
    Product,
    Comment,
    Benchmark,
    DatasheetPool
} = require('./models')

beforeEach(async () => {
    await Comment.deleteMany({})
    await Product.deleteMany({})
    await Post.deleteMany({})
    await Author.deleteMany({})
    await Tag.deleteMany({})
    await Benchmark.deleteMany({})
    await DatasheetPool.deleteMany({})
})

const makeAuthorData = (multiple = false) => {
    if (!multiple) {
        return {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            phone: faker.phone.phoneNumber()
        }
    }
    const data = []
    for (let i = 0; i < multiple; i++) {
        data.push(makeAuthorData())
    }

    return data
}

const makePostData = (author, multiple = false) => {
    if (!multiple) {
        return {
            title: faker.lorem.sentence(),
            content: faker.lorem.text(),
            author
        }
    }

    const data = []
    for (let i = 0; i < multiple; i++) {
        data.push(makePostData(author))
    }

    return data
}

const createAuthorAndPost = (done) => {
    return new Promise((resolve) => {
        Author.create(makeAuthorData()).then((author) => {
            Post.create(makePostData(author)).then((post) => {
                resolve({ author, post })
            }).catch(() => {
                done()
            })
        }).catch(() => {
            done()
        })
    })
}

const createAuthorsAndPosts = (done) => {
    return new Promise((resolve) => {
        const data = makeAuthorData(2)

        Author.insertMany(data).then((authors) => {
            const postsData = []
            for (const author of authors) {
                postsData.push(makePostData(author))
            }

            Post.insertMany(postsData).then((posts) => {
                resolve({ authors, posts })
            }).catch(() => {
                done()
            })
        }).catch(() => {
            done()
        })
    })
}

const createTagAndProduct = (done) => {
    return new Promise((resolve) => {
        Tag.create({
            name: 'my-slugged-tag'
        }).then((tag) => {
            Product.create({
                name: 'My Product',
                price: 100,
                tags: [tag._id]
            }).then((product) => {
                resolve({ tag, product })
            }).catch(() => {
                done()
            })
        }).catch(() => {
            done()
        })
    })
}

const createProductAndBenchmark = (done) => {
    return new Promise((resolve) => {
        Product.create({
            name: 'Product With Datasheet',
            price: 1000,
            datasheet: {
                power: 10,
                weight: 500,
                width: 200,
                height: 25
            }
        }).then((product) => {
            Benchmark.create({
                result: 9.5,
                datasheet: product.datasheet._id
            }).then((benchmark) => {
                resolve({ product, benchmark })
            }).catch(() => {
                done()
            })
        }).catch(() => {
            done()
        })
    })
}

const createProductsAndDatasheetPool = (done) => {
    return new Promise((resolve) => {
        const productData = [
            {
                name: 'Product With Datasheet 1',
                price: 1000,
                datasheet: {
                    power: 10,
                    weight: 1,
                    width: 100,
                    height: 10
                }
            },
            {
                name: 'Product With Datasheet 2',
                price: 2000,
                datasheet: {
                    power: 20,
                    weight: 2,
                    width: 200,
                    height: 20
                }
            },
            {
                name: 'Product With Datasheet 3',
                price: 3000,
                datasheet: {
                    power: 20,
                    weight: 3,
                    width: 300,
                    height: 30
                }
            }
        ]

        Product.insertMany(productData).then((products) => {
            const datasheets = products.map(product => product.datasheet._id)
            DatasheetPool.create({ history: datasheets }).then((pool) => {
                resolve({ products, pool })
            }).catch(() => {
                done()
            })
        }).catch(() => {
            done()
        })
    })
}

const createProductAndDatasheetComment = (done) => {
    return new Promise((resolve) => {
        Product.create({
            name: 'Product With Datasheet',
            price: 1000,
            datasheet: {
                power: 10,
                weight: 500,
                width: 200,
                height: 25
            }
        }).then((product) => {
            Comment.create({
                body: 'Comment of datasheet',
                target: product.datasheet._id,
                forModel: 'Product.datasheet'
            }).then((comment) => {
                resolve({ product, comment })
            }).catch(() => {
                done()
            })
        }).catch(() => {
            done()
        })
    })
}

module.exports = {
    makeAuthorData,
    makePostData,
    createAuthorAndPost,
    createAuthorsAndPosts,
    createTagAndProduct,
    createProductAndBenchmark,
    createProductsAndDatasheetPool,
    createProductAndDatasheetComment
}
