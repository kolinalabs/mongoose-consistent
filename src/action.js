class Action {
    constructor() {
        if (this.constructor.name === 'Action') {
            throw new Error('Action cannot be instantiated directly')
        }

        if (typeof this.supports !== 'function' || typeof this.apply !== 'function') {
            throw new Error('An action must have the supports and apply methods')
        }
    }
}

class CascadeAction extends Action {
    supports({ action }) {
        return action.toLowerCase() === 'cascade'
    }

    async apply({ model, conditions, next }) {
        try {
            await model.deleteMany(conditions)
        } catch (e) {
            next(e)
        }
    }
}

class SetNullAction extends Action {
    supports({ action }) {
        return action.toLowerCase() === 'set_null'
    }

    async apply({ model, conditions, property, next }) {
        try {
            await model.updateMany(conditions, { $set: { [property]: null } })
        } catch (e) {
            next(e)
        }
    }
}

class RestrictAction extends Action {
    supports({ action }) {
        return action.toLowerCase() === 'restrict'
    }

    async apply({ model, conditions, property, next }) {
        try {
            const count = await model.countDocuments(conditions)
            if (count > 0) {
                throw new Error(`Cannot delete a parent doc: ref constraint fails (${model.modelName}.${property})`)
            }
        } catch (e) {
            next(e)
        }
    }
}

class ChainAction {
    constructor() {
        this.actions = [
            new CascadeAction(),
            new SetNullAction(),
            new RestrictAction()
        ]
    }

    async apply(context) {
        for (const referenceAction of this.actions) {
            if (referenceAction.supports(context)) {
                await referenceAction.apply(context)
            }
        }
    }
}

module.exports = {
    Action,
    CascadeAction,
    SetNullAction,
    RestrictAction,
    ChainAction
}
