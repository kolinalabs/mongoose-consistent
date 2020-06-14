const mongoose = require('mongoose')

class ReferenceChecker {
    constructor(modelName, action, references = [], next) {
        this.modelName = modelName
        this.action = action
        this.references = references
        this.next = next
    }

    async check(identifiers = []) {
        for (const reference of this.references) {
            /** @todo
             * Be careful, this action type differs from a relational database
             * because it does not interfere with the statement execution
             */
            if (reference.onDelete === 'no_action') continue

            const { property } = reference
            const conditions = { [property]: { $in: identifiers } }

            if (reference.type === 'refPath') {
                conditions[reference.refPath] = this.modelName
            }

            const refModel = mongoose.model(reference.on)
            const action = reference.onDelete.toLowerCase()

            const context = {
                action,
                model: refModel,
                property,
                conditions,
                reference,
                next: this.next
            }

            await this.action.apply(context)
        }
    }
}

module.exports = ReferenceChecker
