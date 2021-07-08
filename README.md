# mongoose-consistent

Foreign reference check across collections with mongoose.

[![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url] [![downloads]][downloads]

Mongoose allows models from different collections to be related by some type of reference (ref, refPath, array of ObjectIds). However, document deletion operations associated with documentos from another collection, end up affecting the consistency of these relationships.

This library aims to provide mechanisms in an attempt to maintain the relational integrity between documents of different models, using their reference identifiers (_id), as well as types of action (restrict, set_null or cascade), in order to apply constraints similar to those of relational databases, however application level.

### [Check the sample project](https://github.com/kolinalabs/mongoose-consistent-sample)

## Supported API methods

| Save | Delete |
|---	| --- |
| Document.save | Document.delete |
| Document.update | Model.deleteOne  |
| Document.updateOne |
| Model.findByIdAndUpdate | Model.findByIdAndDelete |
| Model.findOneAndReplace | Model.findByIdAndRemove |
| Model.findOneAndUpdate | Model.findOneAndDelete |
| Model.insertMany | Model.findOneAndRemove |
| Model.replaceOne | Model.delete |
| Model.update | Model.remove |
| Model.updateOne | Model.deleteOne |
| Model.updateMany | Model.deleteMany |
| Query.findOneAndReplace | Query.deleteOne |
| Query.findOneAndUpdate | Query.deleteMany |
| Query.replaceOne | Query.findOneAndDelete |
| Query.update | Query.findOneAndRemove |
| Query.updateOne | Query.remove |
| Query.updateMany |

# Usage

Recommended global installation only.

> Note: Configure this plugin before loading models.

```js
    const mongoose = require('mongoose')

    mongoose.plugin(require('@kolinalabs/mongoose-consistent'), {
        eventKey: 'on_delete',      // onDelete (default)
        actionDefault: 'set_null',  // restrict (default)
        saveCheckDefault: false     // true (default)
    })
```

## Options

| Option | default | description |
|---	|---	|---	|
| **eventKey** | onDelete | Change the configuration property on the schema |
| **actionDefault** | restrict | change the default action applied when a referral is found |
| **saveCheckDefault** | true | enable (true), disable (false) or custom (```callback```) saveCheck |

## Actions for delete constraint

**restrict**:

An error is thrown when attempting to delete a parent record.

```js
{
  onDelete: 'restrict'
}
```

**cascade**:

All child records are removed.

```js
{
  onDelete: 'cascade'
}
```

**set_null**:

Sets the referenced property in the children to ```null```.

```js
{
  onDelete: 'set_null'
}
```

**no_action**:

Ignore reference check.

```js
{
  onDelete: 'no_action'
}
```

**callback**:

Use a function to control the behavior of the operation.

```js
{
  onDelete(context) {
      // console.log(context)
  }
}
```

```js
// The 'context' object passed to the callback
{
  config: {
    modelName: 'ItemB',
    pathName: 'refArrayOfObjectRelated.$.itemA',
    modelRefs: ['ItemA'],
    action: 'cascade'
  },
  conditions: {
    'refArrayOfObjectRelated.itemA': {
      '$in': ['60c8e0c2cc629121ac49db5b']
    }
  },
  identifiers: ['60c8e0c2cc629121ac49db5b'],
  targetPath: 'refArrayOfObjectRelated.itemA',
  countRef: 5
}
```

## saveCheck for save constraint

**true**:

Active check during document saving.

```js
{
  saveCheck: true
}
```

**false**:

Inactive check during document saving.

```js
{
  saveCheck: false
}
```

**callback**:

Use a function to control the behavior of the operation.

```js
{
  saveCheck(context) {
      // console.log(context)
  }
}
```

```js
// The 'context' object passed to the callback

{
    config: {
        modelName: 'ChildModel',
        pathName: 'parent',
        modelRefs: ['ParentModel'],
        action: 'restrict',
        saveCheck: true,
    },
    dbName: 'yourdbname',
    childModel: 'ChildModel',
    parentModel: 'ParentModel',
    childKey: 'parent',
    parentKey: '_id',
    childCollection: 'child_collection_name',
    parentCollection: 'parent_collection_name',
    identifier: '60e630a00f29040340f556b7',
}

```

**Note**

> Similar to what happens in relational databases, this configuration must occur in the child schema, corresponding to the weak side of the relationship (ex: 1:N [this side])

# Configuration and behavior matrix

| Association | restrict | cascade | set_null |
|---	|---	|---	|---	|
| ref (ObjectId) | Error | document is removed | field is null |
| refPath | Error | document is removed | field is null |
| array of ObjectId | Error | document is removed | array item is removed |
| array of Subdocuments | Error | subdocument is removed | property of subdocument is null |

[travis_img]: https://travis-ci.com/kolinalabs/mongoose-consistent.svg?branch=master
[travis_url]: https://travis-ci.com/kolinalabs/mongoose-consistent
[npm_img]: https://img.shields.io/npm/v/@kolinalabs/mongoose-consistent.svg
[npm_url]: https://npmjs.com/package/@kolinalabs/mongoose-consistent
[downloads]: https://img.shields.io/npm/dw/@kolinalabs/mongoose-consistent
