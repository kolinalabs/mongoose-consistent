const MODEL_KEYS = [
    'hooks',
    'modelName',
    'db',
    'events',
    'collection',
    'base',
    'schema',
    'Query',
]

class OperationSourceType {
    static get(source) {
        const sourceKeys = Object.keys(source)
        const isModel = MODEL_KEYS.every((key) => sourceKeys.includes(key))

        if (
            isModel &&
            source.constructor &&
            source.constructor.name === 'Function'
        ) {
            return 'model'
        }

        if (
            typeof source.toJSON === 'function' &&
            typeof source.toObject === 'function'
        ) {
            return 'document'
        }

        return 'query'
    }
}

module.exports = OperationSourceType
