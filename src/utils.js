const getTargetDepth = (obj) => {
    const keys = Object.keys(obj)
    return keys.length === 0 ? obj : getTargetDepth(obj[keys[0]])
}

/**
 * Convert a one-dimensional array of keys into an object,
 * where the key of the last level can be valued
 * 
 * @param {Array} data 
 * @param {*} value 
 * @returns 
 */
const arrayToDepthObject = (data = [], value = null) => {
    const obj = {}
    for (const key of data) {
        const targetDepth = getTargetDepth(obj)
        const isLast = data.indexOf(key) === data.length - 1
        targetDepth[key] = isLast ? value : {}
    }

    return obj
}

module.exports = {
    arrayToDepthObject,
}
