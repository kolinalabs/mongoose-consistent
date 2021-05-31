const { assert } = require('chai')
const mongoose = require('mongoose')

const detectDepthPath = require('../src/detect-depth-path')

const LevelSchema3 = new mongoose.Schema({
    name: String,
})

const LevelSchema2 = new mongoose.Schema({
    name: String,
    level3: LevelSchema3
})

const LevelSchema1 = new mongoose.Schema({
    name: String,
    level2: LevelSchema2,
})

const ParentSchema = new mongoose.Schema({
    name: String,
    level1: LevelSchema1,
})

const Parent = mongoose.model('Parent', ParentSchema)

describe('detect path reference on nested document (subSchema)', () => {
    it('should detect path with multi-level configuration', (done) => {
        const root = new Parent({
            name: 'Root',
            level1: {
                name: 'L1',
                level2: {
                    name: 'L2',
                    level3: {
                        name: 'L3'
                    }
                }
            }
        })

        assert.equal(detectDepthPath(root), 'Parent')

        assert.equal(detectDepthPath(root.level1), 'Parent.level1')

        assert.equal(detectDepthPath(root.level1.level2), 'Parent.level1.level2')

        assert.equal(detectDepthPath(root.level1.level2.level3), 'Parent.level1.level2.level3')

        done()
    })
})
