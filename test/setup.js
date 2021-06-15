require('dotenv').config()

const mongoose = require('mongoose')

const action = process.env.ACTION

const options = {
    actionDefault: action
}

mongoose.plugin(require('../src'), options)

const RefConstraintError = require('../src/RefConstraintError')

const { ItemA, ItemB, ItemC, ItemD } = require('./models')

beforeAll(async () => {
    const uri = `${process.env.MONGODB}_${Math.random().toString().replace('.', '')}`
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
})

beforeEach(async () => {
    /**
     * Deleting all docs using native mongodb methods
     * Because mongoose methods dispatches lib events
     */
    for (const collection of Object.values(mongoose.connection.collections)) {
        await collection.deleteMany({})
    }
})

afterAll(() => mongoose.disconnect())

const constraintErrorMessage = (fullPath) => {
    return `Cannot delete a parent doc: ref constraint fails (${fullPath})`
}

module.exports = {
    models: {
        ItemA,
        ItemB,
        ItemC,
        ItemD,
    },
    RefConstraintError,
    ConstraintErrorClass: RefConstraintError,
    constraintErrorMessage,
    action,
}
