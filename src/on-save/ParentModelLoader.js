class ParentModelLoader {
    load(dataObject, config, childModel) {
        for (const modelRef of config.modelRefs) {
            if (
                config.refPath &&
                dataObject[config.refPath] &&
                modelRef !== dataObject[config.refPath]
            ) {
                continue
            }

            let modelInstance = null
            let modelPath = null
            let modelName = null
            try {
                const [modelName, ...restNames] = modelRef.split('.')
                modelInstance = childModel.db.model(modelName)
                modelPath = restNames
            } catch (e) {
                // Ignore Error: Schema hasn't been registered for model
            }

            if (modelInstance) {
                return [modelInstance, modelPath, modelName]
            }
        }

        return []
    }
}

module.exports = ParentModelLoader
