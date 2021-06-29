const mongoose = require('mongoose')

const Mapping = require('../Mapping')
const OperationSourceType = require('../OperationSourceType')
const InsertOrUpdateError = require('../error/InsertOrUpdateError')
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

        const childModel = mongoose.model(childModelName)
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
                                        childModelName,
                                        parentModel: parentModel.modelName,
                                        foreignKey: config.pathName,
                                        childCollection:
                                            childModel.collection.name,
                                        parentCollection:
                                            parentModel.collection.name,
                                        parentKey: '_id',
                                    }

                                    throw new InsertOrUpdateError(context)
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
