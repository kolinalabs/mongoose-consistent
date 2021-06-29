const mongoose = require('mongoose')

const Mapping = require('../Mapping')
const OperationSourceType = require('../OperationSourceType')
const SaveConstraintError = require('./SaveConstraintError')
const ChildModelResolver = require('./ChildModelResolver')
const DataObjectsExtractor = require('./DataObjectsExtractor')
const DataObjectIdentifiersExtractor = require('./DataObjectIdentifiersExtractor')
const ParentModelLoader = require('./ParentModelLoader')

class SaveConstraintChecker {
    constructor(options = {}) {
        this.options = options
        this.childModelResolver = new ChildModelResolver()
        this.dataObjectsExtractor = new DataObjectsExtractor()
        this.dataObjectIdentifiersExtractor =
            new DataObjectIdentifiersExtractor()
        this.parentModelLoader = new ParentModelLoader()
    }

    async check(source, extra = []) {
        const mapping = Mapping.refresh(this.options)
        const sourceType = OperationSourceType.get(source)

        const childModelName = await this.childModelResolver.resolve(
            source,
            sourceType
        )

        const dataObjects = await this.dataObjectsExtractor.extract(
            source,
            sourceType,
            extra
        )

        /** @todo if dataObjects is empty: return */
        // console.log({ dataObjects })

        const [rootModelName, ...restModelNAme] = childModelName.split('.')

        const childModel = mongoose.model(rootModelName)

        const mapped = mapping.filter((i) => i.modelName === childModelName)

        const cachedResult = {}
        for (const dataObject of dataObjects) {
            for (const config of mapped) {
                const identifiers =
                    await this.dataObjectIdentifiersExtractor.extract(
                        dataObject,
                        config
                    )

                if (identifiers.length) {
                    const [parentModel, modelPath] =
                        this.parentModelLoader.load(
                            dataObject,
                            config,
                            childModel
                        )

                    if (parentModel) {
                        modelPath.push('_id')
                        const targetPath = modelPath.join('.')

                        for (const identifier of identifiers) {
                            const cacheKey = `${parentModel.modelName}_${identifier}`

                            if (!cachedResult.hasOwnProperty(cacheKey)) {
                                const criteria = {
                                    [targetPath]: identifier,
                                }

                                const doc = await parentModel.findOne(
                                    criteria,
                                    '_id'
                                )

                                if (!doc) {
                                    const context = {
                                        dbName: mongoose.connection.name,
                                        childModel: rootModelName,
                                        parentModel: parentModel.modelName,
                                        childKey: config.pathName,
                                        parentKey: '_id',
                                        childCollection:
                                            childModel.collection.name,
                                        parentCollection:
                                            parentModel.collection.name,
                                        identifier,
                                    }

                                    throw new SaveConstraintError(context)
                                }

                                cachedResult[cacheKey] = true
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = SaveConstraintChecker
