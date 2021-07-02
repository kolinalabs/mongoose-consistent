const Action = require('./Action')

class ActionCallback extends Action {
    async supports({ config }) {
        return typeof config.action === 'function'
    }

    async apply(context) {
        const { config } = context
        await config.action(context)
    }
}

module.exports = ActionCallback
