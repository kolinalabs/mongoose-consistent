const RefConstraintChecker = require('./RefConstraintChecker')

const _DELETE = [
    'remove',
    'deleteOne',
    'deleteMany',
    'findOneAndDelete',
    'findOneAndRemove',
    'findByIdAndDelete',
    'findByIdAndRemove',
]

const _SAVE = [
    // document
    'save',
    // query
    'update',
    'updateOne', // and document
    'updateMany',
    'findOneAndUpdate',
    // model
    'insertMany',
]

module.exports = (schema, options = {}) => {
    schema.pre(_DELETE, async function (next) {
        const refConstraintChecker = new RefConstraintChecker(options)
        try {
            await refConstraintChecker.check(this)
        } catch (e) {
            return next(e)
        }
    })

    schema.pre(_SAVE, async function (next) {
        const refConstraintChecker = new RefConstraintChecker(options)
        try {
            await refConstraintChecker.onSave(this, Array.from(arguments))
        } catch (e) {
            return next(e)
        }
    })
}
