const mongoose = require('mongoose')
const Mapping = require('../Mapping')
const TargetExtractor = require('../TargetExtractor')
const IdentifierExtractor = require('./IdentifierExtractor')
const ActionChain = require('./ActionChain')

class DeleteConstraintChecker {
    constructor(options = {}) {
        this.targetExtractor = new TargetExtractor()
        this.identifierExtractor = new IdentifierExtractor()
        this.options = Object.assign(
            {
                eventKey: 'onDelete',
                actionDefault: 'restrict',
            },
            options
        )
    }

    async check(source) {
        const mapping = Mapping.refresh(this.options)
        const identifiers = await this.identifierExtractor.extract(source)
        const target = await this.targetExtractor.extract(source)

        if (source.constructor.name === 'Query') {
            for await (const doc of source.cursor()) {
                try {
                    await doc.remove()
                } catch (e) {
                    throw e
                }
            }
        }

        const mapped = mapping.filter((i) => i.modelRefs.includes(target))

        for (const config of mapped) {
            const modelInstance = mongoose.model(config.modelName)
            const targetPath = config.pathName.replace('.$', '')
            const conditions = { [targetPath]: { $in: identifiers } }

            if (config.refPath) {
                conditions[config.refPath] = target
            }

            const countRef = await modelInstance.countDocuments(conditions)

            if (countRef > 0) {
                const context = {
                    modelInstance,
                    config,
                    conditions,
                    identifiers,
                    targetPath,
                    countRef,
                }

                const action = new ActionChain()

                await action.apply(context)
            }
        }
    }
}

module.exports = DeleteConstraintChecker
