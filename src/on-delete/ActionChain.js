const ActionCallback = require('./ActionCallback')
const ActionCascade = require('./ActionCascade')
const ActionRestrict = require('./ActionRestrict')
const ActionSetNull = require('./ActionSetNull')

class ActionChain {
    constructor() {
        this.actions = [
            new ActionRestrict(),
            new ActionCascade(),
            new ActionSetNull(),
            new ActionCallback(),
        ]
    }

    async apply(context) {
        for (const action of this.actions) {
            const supports = await action.supports(context)
            if (supports) {
                await action.apply(context)
                break
            }
        }
    }
}

module.exports = ActionChain
