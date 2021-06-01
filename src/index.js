const RefConstraintChecker = require('./RefConstraintChecker')

const MIDDLEWARES = [
    'remove',
    'deleteOne',
    'deleteMany',
    'findOneAndDelete',
    'findOneAndRemove',
]

module.exports = (schema, options = {}) => {
    schema.pre(MIDDLEWARES, async function (next) {
        const refConstraintChecker = new RefConstraintChecker(options)
        try {
            await refConstraintChecker.check(this)
        } catch (e) {
            return next(e)
        }
    })
}
