const mongoose = require('mongoose')

const detectDepthPath = require('./detect-depth-path')

class RefConstraintError extends Error {
    constructor(checker) {
        const { modelName, pathName } = checker
        const message = `Cannot delete a parent doc: ref constraint fails (${modelName}.${pathName})`
        super(message)
        this.checker = checker
    }
}

const checkConstraints = async (source, ids, next, config) => {
    const depthPath = detectDepthPath(source)

    if (!depthPath || depthPath.length === 0) {
        return
    }

    const { actionDefault } = config

    const checkers = []
    for (const schemaName in mongoose.modelSchemas) {
        const mSchema = mongoose.modelSchemas[schemaName]

        for (const pathName in mSchema.paths) {
            if (['__v', '_id'].includes(pathName)) {
                continue
            }

            const pathSchema = mSchema.paths[pathName]
            const pathInstance = pathSchema.instance

            if (pathInstance === 'ObjectID') {
                if (
                    pathSchema.options &&
                    pathSchema.options.ref &&
                    pathSchema.options.ref === depthPath
                ) {
                    checkers.push({
                        pathName,
                        modelName: schemaName,
                        conditions: { [pathName]: ids },
                        onDelete: pathSchema.options.onDelete || actionDefault
                    })
                }

                if (
                    pathSchema.options &&
                    pathSchema.options.refPath
                ) {
                    const { refPath, onDelete } = pathSchema.options
                    const { enumValues } = mSchema.paths[refPath]

                    if (Array.isArray(enumValues)) {
                        for (const enumValue of enumValues) {
                            if (depthPath === enumValue) {
                                checkers.push({
                                    pathName,
                                    onDelete,
                                    modelName: schemaName,
                                    conditions: {
                                        [pathName]: ids,
                                        [refPath]: enumValue
                                    }
                                })
                            }
                        }
                    }
                }
            }

            if (pathInstance === 'Array') {
                if (
                    pathSchema.options &&
                    pathSchema.options.type &&
                    pathSchema.options.type[0] &&
                    pathSchema.options.type[0].ref &&
                    pathSchema.options.type[0].ref === depthPath
                ) {
                    const arrayOptions = pathSchema.options.type[0]
                    checkers.push({
                        pathName,
                        modelName: schemaName,
                        conditions: { [pathName]: { $in: [ids] } },
                        onDelete: arrayOptions.onDelete || actionDefault
                    })
                }
            }
        }
    }

    for (const checker of checkers) {
        const { modelName, conditions, onDelete, pathName } = checker
        const model = mongoose.model(modelName)
        const count = await model.countDocuments(conditions)

        if (count > 0 && onDelete !== 'no_action') {
            switch (onDelete) {
                case 'restrict':
                    next(new RefConstraintError(checker))
                    break
                case 'set_null':
                    const pathType = model.schema.paths[pathName].constructor.name
                    switch (pathType) {
                        case 'ObjectId':
                            await model.updateMany(conditions, { $set: { [pathName]: null } })
                            break
                        case 'SchemaArray':
                            await model.updateMany(conditions, { $pull: conditions })
                            break
                    }
                    break
                case 'cascade':
                    await model.deleteMany(conditions)
                    break
            }
        }
    }
}

module.exports = (schema, options = {}) => {
    const config = Object.assign({
        actionDefault: 'no_action'
    }, options)

    schema.pre('remove', async function (next) {
        await checkConstraints(this, this._id, next, config)
    })

    schema.pre('deleteMany', async function (next) {
        const docs = await this.model.find(this._conditions, { $select: '_id' }).lean()
        const ids = docs.map(doc => doc._id)

        if (ids.length > 0) {
            await checkConstraints(this, ids, next, config)
        }
    })
}
