const mongoose = require('mongoose')

// action types
const NO_ACTION = 'no_action'
const SET_NULL = 'set_null'
const CASCADE = 'cascade'
const RESTRICT = 'restrict'

const ACTIONS = [NO_ACTION, SET_NULL, CASCADE, RESTRICT]

const MIDDLEWARES = [
    'remove',
    'deleteOne',
    'deleteMany',
    'findOneAndDelete',
    'findOneAndRemove',
]

let eventKey = 'onDelete'
let actionDefault = NO_ACTION

const getTargetRef = (document) => {
    const targetRef = document.constructor.modelName
        ? [document.constructor.modelName]
        : []

    if (document.constructor.name === 'Query') {
        targetRef.push(document.model.modelName)
    }

    if (typeof document.parent === 'function') {
        targetRef.push(getTargetRef(document.parent()))

        const { childSchemas } = document.parent().schema
        const documentSchemaKeys = JSON.stringify(
            Object.keys(document.schema.obj)
        )

        for (const childSchema of childSchemas) {
            const childModelSchemaKeys = Object.keys(
                childSchema.model.schema.obj
            )
            if (JSON.stringify(childModelSchemaKeys) === documentSchemaKeys) {
                targetRef.push(childSchema.model.path)
                break
            }
        }
    }

    return targetRef.join('.')
}

const filterPathReferences = (from, to, paths, pathPrefix = null) => {
    const references = []
    for (const [pathName, pathSchema] of Object.entries(paths)) {
        const path = pathPrefix ? `${pathPrefix}.${pathName}` : pathName

        if (
            pathSchema.options &&
            pathSchema.options.ref &&
            pathSchema.options.ref === from
        ) {
            const action = pathSchema.options[eventKey] || actionDefault

            references.push({
                from,
                to,
                path,
                action,
                mode: 'ref',
            })
        }

        if (pathSchema.options && pathSchema.options.refPath) {
            const { refPath } = pathSchema.options
            const fieldRef = paths[refPath]

            // Direct ref
            if (
                fieldRef &&
                fieldRef.options &&
                Array.isArray(fieldRef.options.enum) &&
                fieldRef.options.enum.includes(from)
            ) {
                const action = pathSchema.options[eventKey] || actionDefault

                references.push({
                    from,
                    to,
                    path,
                    action,
                    mode: 'refPath',
                    refPath: fieldRef.path,
                    refDefault: fieldRef.options.default || null,
                })
            }
        }

        // Subschema / Subdocs
        if (pathSchema.schema && pathSchema.schema.paths) {
            references.push(
                ...filterPathReferences(
                    from,
                    to,
                    pathSchema.schema.paths,
                    pathName
                )
            )
        }

        // array of ObjectId
        if (
            !pathSchema.schema &&
            pathSchema.instance === 'Array' &&
            pathSchema.options &&
            Array.isArray(pathSchema.options.type) &&
            pathSchema.options.type[0] &&
            pathSchema.options.type[0].ref &&
            pathSchema.options.type[0].ref === from
        ) {
            const action = pathSchema.options.type[0][eventKey] || actionDefault

            references.push({
                from,
                to,
                path,
                action,
                mode: 'ref',
                instance: pathSchema.instance,
            })
        }
    }

    return references
}

const getGraphReference = (targetRef) => {
    const graphReference = []
    for (const modelName of mongoose.modelNames()) {
        const currentModel = mongoose.model(modelName)

        if (!currentModel) continue

        const modelSchema = currentModel.schema

        graphReference.push(
            ...filterPathReferences(targetRef, modelName, modelSchema.paths)
        )
    }

    return graphReference
}

const resolveIdentifiers = async (source) => {
    if (source.constructor.name === 'model') {
        return [source._id]
    }

    const docs = await source.model.find(source._conditions, { select: '_id' })

    return docs.map((doc) => doc._id)
}

module.exports = (schema, options = {}) => {
    if (typeof options.eventKey === 'string' && options.eventKey.length > 0) {
        eventKey = options.eventKey
    }

    if (
        typeof options.actionDefault === 'function' ||
        (typeof options.actionDefault === 'string' &&
            ACTIONS.includes(options.actionDefault))
    ) {
        actionDefault = options.actionDefault
    }

    schema.pre(MIDDLEWARES, async function (next) {
        const identifiers = await resolveIdentifiers(this)
        const targetRef = getTargetRef(this)
        const graphReference = getGraphReference(targetRef, eventKey)

        for (const reference of graphReference) {
            if (reference.action === NO_ACTION) {
                continue
            }

            const model = mongoose.model(reference.to)
            const conditions = { [reference.path]: { $in: identifiers } }

            if (reference.mode === 'refPath') {
                conditions[reference.refPath] = reference.from
            }

            const countRef = await model.countDocuments(conditions)

            if (countRef > 0) {
                switch (reference.action) {
                    case RESTRICT:
                        next(new Error('FK constraint error'))
                        break
                    case CASCADE:
                        if (reference.instance === 'Array') {
                            await model.updateMany(conditions, {
                                $pull: conditions,
                            })
                        } else {
                            await model.deleteMany(conditions)
                        }
                        break
                    case SET_NULL:
                        const update = { $set: { [reference.path]: null } }

                        if (reference.mode === 'refPath') {
                            update[reference.refPath] = reference.refDefault
                        }

                        if (reference.instance === 'Array') {
                            await model.updateMany(conditions, {
                                $pull: conditions,
                            })
                        } else {
                            await model.updateMany(conditions, update)
                        }
                        break
                    default:
                        if (typeof reference.action === 'function') {
                            await reference.action({
                                source: this,
                                reference,
                                next
                            })
                        }
                        break
                }
            }
        }
    })
}
