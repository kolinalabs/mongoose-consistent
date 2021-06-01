const mongoose = require('mongoose')

const NO_ACTION = 'no_action'
const SET_NULL = 'set_null'
const CASCADE = 'cascade'
const RESTRICT = 'restrict'

const Mapping = require('./Mapping')
const cascade = require('./action/cascade')
const setNull = require('./action/set-null')
const restrict = require('./action/restrict')
const TargetExtractor = require('./TargetExtractor')
const IdentifierExtractor = require('./IdentifierExtractor')

class RefConstraintChecker {
    constructor(options = {}) {
        this.options = Object.assign(
            {
                eventKey: 'onDelete',
                actionDefault: 'restrict',
            },
            options
        )

        this.targetExtractor = new TargetExtractor()
        this.identifierExtractor = new IdentifierExtractor()
    }

    async check(source) {
        const mapping = Mapping.refresh({ eventKey: this.options.eventKey })
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
                }

                switch (config.action) {
                    case RESTRICT:
                        await restrict(context)
                    case CASCADE:
                        await cascade(context)
                        break
                    case SET_NULL:
                        await setNull(context)
                        break
                    case NO_ACTION:
                    default:
                        if (typeof config.action === 'function') {
                            await config.action({
                                source: source,
                                reference: config,
                                next,
                            })
                        }
                        break
                }
            }
        }
    }
}

module.exports = RefConstraintChecker
