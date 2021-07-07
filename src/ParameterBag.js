class ParameterBag {
    constructor(parameters) {
        this.parameters = parameters
    }

    get(key, _default = null) {
        return this.parameters[key] || _default
    }

    getBoolean(key, _default = false) {
        return typeof this.parameters[key] === 'boolean'
            ? this.get(key)
            : _default
    }
}

module.exports = ParameterBag
