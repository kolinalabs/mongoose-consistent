require('dotenv').config()

const mongoose = require('mongoose')

mongoose.plugin(require('../../src/plugin'))

const RefConstraintError = require('../../src/RefConstraintError')

const { ItemA, ItemB, ItemC, ItemD } = require('./models')

const action = process.env.ACTION

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB, {
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
