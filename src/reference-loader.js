class ReferenceLoader {
    static load(modelName, modelSchemas, actionDefault = 'no_action') {
        if (typeof modelName !== 'string') {
            throw new Error('The model name must be a string')
        }

        if (typeof modelSchemas !== 'object' || Array.isArray(modelSchemas)) {
            throw new Error('The modelSchemas must be a schemas object')
        }

        if (!Object.keys(modelSchemas).includes(modelName)) {
            throw new Error('The modelName is not defined in modelSchemas')
        }

        const constraints = []
        for (const schemaName in modelSchemas) {
            const modelSchema = modelSchemas[schemaName]
            for (const pathName in modelSchema.paths) {
                const pathSchema = modelSchema.paths[pathName]
                if (
                    pathSchema.options.ref &&
                    pathSchema.options.ref === modelName
                ) {
                    constraints.push({
                        type: 'ref',
                        on: schemaName,
                        property: pathName,
                        onDelete: pathSchema.options.onDelete || actionDefault,
                        path: pathSchema
                    })
                } else if (pathSchema.options.refPath) {
                    const { refPath } = pathSchema.options
                    const fieldRefPath = modelSchema.paths[refPath]
                    const enumRefPath = fieldRefPath.options.enum

                    if (enumRefPath.includes(modelName)) {
                        constraints.push({
                            type: 'refPath',
                            on: schemaName,
                            property: pathName,
                            refPath: fieldRefPath.path,
                            onDelete: pathSchema.options.onDelete || actionDefault,
                            path: pathSchema
                        })
                    }
                } else if (
                    pathSchema.options.type &&
                    pathSchema.options.type[0] &&
                    pathSchema.options.type[0].ref === modelName
                ) {
                    constraints.push({
                        type: 'array',
                        on: schemaName,
                        property: pathName,
                        onDelete: pathSchema.options.type[0].onDelete || actionDefault,
                        path: pathSchema
                    })
                }
            }
        }

        return constraints
    }
}

module.exports = ReferenceLoader
