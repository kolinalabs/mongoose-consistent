const mongoose = require('mongoose')

const pathLoaded = []

const recursivePathLoader = ({
    modelName,
    modelSchema,
    parentPath,
    eventKey,
}) => {
    for (const pathSchema of Object.values(modelSchema.paths)) {
        const pathName = !parentPath
            ? pathSchema.path
            : `${parentPath}.${pathSchema.path}`

        if (pathSchema.options.ref) {
            const action = pathSchema.options[eventKey] || 'restrict'

            pathLoaded.push({
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

                pathLoaded.push({
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
                            pathSchema.$embeddedSchemaType.options[eventKey] ||
                            'restrict'

                        pathLoaded.push({
                            modelName,
                            pathName: `${pathSchema.path}.$`,
                            modelRefs:
                                [pathSchema.$embeddedSchemaType.options.ref],
                            action,
                        })
                    }
                } else if (
                    pathSchema.$embeddedSchemaType.constructor.name ===
                    'SchemaType'
                ) {
                    recursivePathLoader({
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

class Mapping {
    constructor() {
        this.eventKey = 'onDelete'
        this.actionDefault = 'restrict'
        this.mapping = {}
    }

    refresh({ eventKey }) {
        this.eventKey = eventKey

        for (const modelName in mongoose.models) {
            if (!this.has(modelName)) {
                this.mapping[modelName] = {
                    modelName,
                    associations: [],
                }

                const modelSchema = mongoose.modelSchemas[modelName]

                recursivePathLoader({
                    modelName,
                    modelSchema,
                    eventKey,
                })

                // console.log({ pathLoaded })
                // this._mapPaths(modelName, modelSchema)
                // this._mapSubPaths(modelName, modelSchema)
            }
        }

        return pathLoaded
    }

    associations(modelName) {
        return this.has(modelName) ? this.mapping[modelName].associations : []
    }

    has(modelName) {
        return this.mapping.hasOwnProperty(modelName)
    }

    _mapPaths(modelName, modelSchema) {
        for (const pathSchema of Object.values(modelSchema.paths)) {
            const property = pathSchema.path
            const instance = pathSchema.instance
            const action =
                pathSchema.options[this.eventKey] || this.actionDefault

            if (pathSchema.options.ref) {
                this.mapping[modelName].associations.push({
                    mode: 'ref',
                    property,
                    instance,
                    target: [pathSchema.options.ref],
                    action,
                })
                continue
            }

            if (pathSchema.options.refPath) {
                const refPathSchema =
                    modelSchema.paths[pathSchema.options.refPath]

                this.mapping[modelName].associations.push({
                    mode: 'refPath',
                    refPath: pathSchema.options.refPath,
                    refDefault: refPathSchema.options.default,
                    property,
                    instance,
                    target: refPathSchema.options.enum,
                    action,
                })
                continue
            }
        }
    }

    _mapSubPaths(modelName, modelSchema) {
        for (const [fullPath, pathSchema] of Object.entries(
            modelSchema.subpaths
        )) {
            // if (fullPath === 'refArrayOfObjectRelated.itemA') {
            //     console.log(pathSchema)
            // }

            if (pathSchema.options.ref) {
                this.mapping[modelName].associations.push({
                    mode: 'ref',
                    property: fullPath,
                    instance: 'Array',
                    target: [pathSchema.options.ref],
                    action:
                        pathSchema.options[this.eventKey] || this.actionDefault,
                })
                continue
            }
        }
    }
}

module.exports = new Mapping()
