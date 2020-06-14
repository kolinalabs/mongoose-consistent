const mongoose = require('mongoose')
const { assert } = require('chai')

const ReferenceLoader = require('../src/reference-loader')

describe('should throw errors for invalid parameters', () => {
    it('modelName is not of type string', (done) => {
        let errorMessage = null
        try {
            ReferenceLoader.load({})
        } catch({ message }) {
            errorMessage = message
        }

        assert.equal(errorMessage, 'The model name must be a string')
        
        done()
    })

    it('modelSchemas is invalid', (done) => {
        let errorMessage = null
        try {
            ReferenceLoader.load('Author', [])
        } catch({ message }) {
            errorMessage = message
        }

        assert.equal(errorMessage, 'The modelSchemas must be a schemas object')
        
        done()
    })

    it('modelName is not in the modelSchemas', (done) => {
        let errorMessage = null
        try {
            ReferenceLoader.load('Foo', mongoose.modelSchemas)
        } catch({ message }) {
            errorMessage = message
        }

        assert.equal(errorMessage, 'The modelName is not defined in modelSchemas')
        
        done()
    })
})

describe('load via model', () => {
    it('shoud load via ref', (done) => {
        const constraints = ReferenceLoader.load('Author', mongoose.modelSchemas)

        assert.equal(constraints.length, 1)
        assert.equal('Post', constraints[0].on)
        assert.equal('ref', constraints[0].type)

        done()
    })

    it('shoud load via refPath', (done) => {
        const constraints = ReferenceLoader.load('Post', mongoose.modelSchemas)

        assert.equal(constraints.length, 1)
        assert.equal('Comment', constraints[0].on)
        assert.equal('refPath', constraints[0].type)

        done()
    })

    it('shoud load via array of ObjectId', (done) => {
        const constraints = ReferenceLoader.load('Tag', mongoose.modelSchemas)

        assert.equal(constraints.length, 1)
        assert.equal('Product', constraints[0].on)
        assert.equal('array', constraints[0].type)

        done()
    })
})
