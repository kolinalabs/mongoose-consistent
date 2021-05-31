const mongoose = require('mongoose')

class Mapping {
    constructor() {
        this.mapped = []
        this.pathLoaded = []
    }

    refresh({ eventKey }) {
        for (const modelName in mongoose.models) {
            if (!this.has(modelName)) {
                const modelSchema = mongoose.modelSchemas[modelName]

                this.recursivePathLoader({
                    modelName,
                    modelSchema,
                    eventKey,
                })

                this.mapped.push(modelName)
            }
        }

        return this.pathLoaded
    }

    recursivePathLoader({ modelName, modelSchema, parentPath, eventKey }) {
        for (const pathSchema of Object.values(modelSchema.paths)) {
            const pathName = !parentPath
                ? pathSchema.path
                : `${parentPath}.${pathSchema.path}`

            if (pathSchema.options.ref) {
                const action = pathSchema.options[eventKey] || 'restrict'

                this.pathLoaded.push({
                    modelName,
                    pathName,
                    modelRefs: [pathSchema.options.ref],
                    action,
                })
            } else {
                if (pathSchema.options.refPath) {
                    const refPathSchema =
                        modelSchema.paths[pathSchema.options.refPath]
                    const action = pathSchema.options[eventKey] || 'restrict'

                    this.pathLoaded.push({
                        modelName,
                        pathName,
                        modelRefs: refPathSchema.options.enum,
                        refPath: pathSchema.options.refPath,
                        refPathDefault: refPathSchema.options.default,
                        action,
                    })
                } else if (
                    pathSchema.instance === 'Array' &&
                    pathSchema.$embeddedSchemaType
                ) {
                    // Array of ObjectId(s)
                    if (
                        pathSchema.$embeddedSchemaType.constructor.name ===
                        'ObjectId'
                    ) {
                        if (
                            pathSchema.$embeddedSchemaType.options &&
                            pathSchema.$embeddedSchemaType.options.ref
                        ) {
                            const action =
                                pathSchema.$embeddedSchemaType.options[
                                    eventKey
                                ] || 'restrict'

                            this.pathLoaded.push({
                                modelName,
                                pathName: `${pathSchema.path}.$`,
                                modelRefs: [
                                    pathSchema.$embeddedSchemaType.options.ref,
                                ],
                                action,
                            })
                        }
                    } else if (
                        pathSchema.$embeddedSchemaType.constructor.name ===
                        'SchemaType'
                    ) {
                        this.recursivePathLoader({
                            modelName,
                            modelSchema: pathSchema.$embeddedSchemaType.schema,
                            parentPath: `${pathSchema.path}.$`,
                            eventKey,
                        })
                    }
                }
            }
        }
    }

    has(modelName) {
        return this.mapped.includes(modelName)
    }
}

module.exports = new Mapping()
