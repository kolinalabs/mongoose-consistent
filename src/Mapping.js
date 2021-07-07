const mongoose = require('mongoose')
const ParameterBag = require('./ParameterBag')

const getRefMode = (pathSchema) => {
    if (pathSchema.options.ref) {
        return 'ref'
    } else {
        if (pathSchema.options.refPath) {
            return 'refPath'
        }
        if (pathSchema.instance === 'Array' && pathSchema.$embeddedSchemaType) {
            if (
                pathSchema.$embeddedSchemaType.constructor.name === 'ObjectId'
            ) {
                return 'embedded_object_ids'
            }

            if (
                pathSchema.$embeddedSchemaType.constructor.name === 'SchemaType'
            ) {
                return 'embedded_subschemas'
            }
        }
    }

    return null
}

class Mapping {
    constructor() {
        this.mapped = []
        this.pathLoaded = []
    }

    refresh({ eventKey, actionDefault, saveCheckDefault }) {
        for (const modelName in mongoose.models) {
            if (!this.mapped.includes(modelName)) {
                const modelSchema = mongoose.modelSchemas[modelName]

                this.recursivePathLoader({
                    modelName,
                    modelSchema,
                    eventKey,
                    actionDefault,
                    saveCheckDefault,
                })

                this.mapped.push(modelName)
            }
        }

        return this.pathLoaded
    }

    recursivePathLoader(config) {
        const {
            modelName,
            modelSchema,
            parentPath,
            eventKey,
            actionDefault,
            saveCheckDefault,
        } = config
        for (const pathSchema of Object.values(modelSchema.paths)) {
            const pathName = !parentPath
                ? pathSchema.path
                : `${parentPath}.${pathSchema.path}`

            const params = new ParameterBag(pathSchema.options)

            const saveCheck = params.getBoolean('saveCheck', saveCheckDefault)

            const refStrategy = getRefMode(pathSchema)

            switch (refStrategy) {
                case 'ref':
                    this.pathLoaded.push({
                        modelName,
                        pathName,
                        modelRefs: [pathSchema.options.ref],
                        action: params.get(eventKey, actionDefault),
                        saveCheck,
                    })
                    break
                case 'refPath':
                    const refPathSchema =
                        modelSchema.paths[pathSchema.options.refPath]

                    this.pathLoaded.push({
                        modelName,
                        pathName,
                        modelRefs: refPathSchema.options.enum,
                        refPath: pathSchema.options.refPath,
                        refPathDefault: refPathSchema.options.default,
                        action: params.get(eventKey, actionDefault),
                        saveCheck,
                    })
                    break
                case 'embedded_object_ids':
                    if (
                        pathSchema.$embeddedSchemaType.options &&
                        pathSchema.$embeddedSchemaType.options.ref
                    ) {
                        const { ref } = pathSchema.$embeddedSchemaType.options
                        
                        this.pathLoaded.push({
                            modelName,
                            pathName: `${pathSchema.path}.$`,
                            modelRefs: [ref],
                            action:
                                pathSchema.$embeddedSchemaType.options[
                                    eventKey
                                ] || actionDefault,
                            saveCheck,
                        })
                    }
                    break
                case 'embedded_subschemas':
                    this.recursivePathLoader({
                        modelName,
                        modelSchema: pathSchema.$embeddedSchemaType.schema,
                        parentPath: `${pathSchema.path}.$`,
                        eventKey,
                        actionDefault,
                        saveCheckDefault,
                    })
                    break
            }
        }
    }
}

module.exports = new Mapping()
