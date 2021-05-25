const mongoose = require('mongoose')

const EVENT_KEY = 'onDelete'

const SideASchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Side A',
    },
})

const ObjectRelatedSchema = new mongoose.Schema({
    token: {
        type: String,
        default() {
            return Math.random()
        },
    },
    sideA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SideA',
    },
})

const SingleNestedSchema = new mongoose.Schema({
  token: {
      type: String,
      default() {
          return Math.random()
      },
  }
})

const SideBSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Side B'
    },
    refSideA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SideA',
        [EVENT_KEY]: 'cascade'
        // [EVENT_KEY]: function(args) {
        //     console.log({ args })
        // }
    },
    refPathSample: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'modelType',
        [EVENT_KEY]: 'set_null'
    },
    modelType: {
        type: String,
        required: true,
        default: 'None',
        enum: ['Product', 'SideA', 'None'],
    },
    refArrayOfObjectIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SideA',
            [EVENT_KEY]: 'set_null'
        },
    ],
    refArrayOfObjectRelated: [{
        type: ObjectRelatedSchema
    }],
    singleNested: SingleNestedSchema,
    arrayNested: [ SingleNestedSchema ]
})

const SideCSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Side C',
    },
    singleNestedB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SideB.singleNested',
        [EVENT_KEY]: 'cascade'
    },
    arrayNestedB: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SideB.singleNested',
        [EVENT_KEY]: 'set_null'
    }],
})

const SideA = mongoose.model('SideA', SideASchema, 'side_a')
const SideB = mongoose.model('SideB', SideBSchema, 'side_b')
const SideC = mongoose.model('SideC', SideCSchema, 'side_c')

module.exports = {
    SideA,
    SideB,
    SideC
}
