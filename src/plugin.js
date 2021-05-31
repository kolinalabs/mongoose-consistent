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
let actionDefault = CASCADE

const getTargetRef = require('./extract-target')
const extractIdentifiers = require('./extract-identifiers')
const Mapping = require('./mapping')
const RefConstraintError = require('./RefConstraintError')
const { arrayToDepthObject } = require('./utils')
const cascade = require('./action/cascade')
const setNull = require('./action/set-null')
const restrict = require('./action/restrict')

/**
 * @todo Prevent change 'actionDefault/eventKey' multiple times
 */
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

    Mapping.eventKey = eventKey
    Mapping.actionDefault = actionDefault

    schema.pre(MIDDLEWARES, async function (next) {
        const mapping = Mapping.refresh({ eventKey })

        // console.log(mapping)

        const identifiers = await extractIdentifiers(this)
        const target = await getTargetRef(this)

        if (this.constructor.name === 'Query') {
            for await (const doc of this.cursor()) {
                try {
                    await doc.remove()
                } catch (e) {
                    return next(e)
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

            // console.log({ countRef })

            const reference = config

            if (countRef > 0) {
                try {
                    const context = {
                        modelInstance,
                        config,
                        conditions,
                        identifiers,
                        next,
                        targetPath
                    }

                    switch (reference.action) {
                        case RESTRICT:
                            return restrict(context)
                        case CASCADE:
                            await cascade(context)
                            break
                        case SET_NULL:
                            await setNull(context)
                            break
                        default:
                            if (typeof reference.action === 'function') {
                                await reference.action({
                                    source: this,
                                    reference: config,
                                    next,
                                })
                            }
                            break
                    }
                } catch (e) {
                    return next(e)
                }
            }
            //}
        }
    })
}
