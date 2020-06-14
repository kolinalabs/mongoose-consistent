const mongoose = require('mongoose')

const ReferenceChecker = require('./reference-checker')
const ReferenceLoader = require('./reference-loader')
const { ChainAction } = require('./action')

const checkAndApply = async (modelName, identifiers = [], next, options) => {
    const action = new ChainAction()
    const references = ReferenceLoader.load(modelName, mongoose.modelSchemas, options.actionDefault)
    const checker = new ReferenceChecker(modelName, action, references, next)

    await checker.check(identifiers)
}

module.exports = (schema, options = {
    actionDefault: 'no_action'
}) => {
    schema.pre('remove', async function (next) {
        const { modelName } = this.constructor
        await checkAndApply(modelName, [this._id], next, options)
    })

    schema.pre('deleteMany', async function (next) {
        const { modelName } = this.model
        const docs = await this.model.find(this._conditions, { $select: '_id' }).lean()
        const ids = docs.map(doc => doc._id)

        if (ids.length > 0) {
            await checkAndApply(modelName, ids, next, options)
        }
    })
}
