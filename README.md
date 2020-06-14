# Mongoose Consistent

Mongoose allows models from different collections to be related by some type of reference (ref, refPath, array of ObjectIds). However, document deletion operations associated with documentos from another collection, end up affecting the consistency of these relationships.

This library aims to provide mechanisms in an attempt to maintain the relational integrity between documents of different models, using their reference identifiers (_id), as well as types of action (), in order to apply constraints similar to those of relational databases, however application level.

# Usage

**Note**
> Similar to what happens in relational databases, this configuration must occur in the child schema, corresponding to the weak side of the relationship (ex: 1:N [this side])

```js
// Author write post
const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'Author',
        onDelete: 'no_action'    // 'cascade' or 'no_action' (default)
    }
})
```

## Supported action types

**restrict**: An error is thrown when attempting to delete a parent record related to a child record.

**Note**
> When using **deleteMany** with actionType **restrict**, if only one of the documents is related to another record, the error is thrown and none of the deletion operations occur.

**cascade**: All child records are removed.

**set_null**: Sets the referenced property in the children to 'null'

**no_action (default)**: Ignore reference check.

## Supported reference types

**ref**

```js
const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'Author',
        onDelete: 'restrict'
    }
}, { timestamps: true })
```

**refPath**

```js
const CommentSchema = new mongoose.Schema({
    body: String,
    target: {
        type: mongoose.Types.ObjectId,
        required: true,
        refPath: 'forModel',
        onDelete: 'set_null'
    },
    forModel: {
        type: String,
        required: true,
        enum: ['Post', 'Product']
    }
})
```

**array of ObjectId**

```js
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    tags: [{
        type: mongoose.Types.ObjectId,
        ref: 'Tag',
        onDelete: 'cascade'
    }]
})
```

**Note**
> When using the action type **cascade** in such a configuration, the entire document is removed.

# Running tests

- Copy '.env.example' file to '.env'
- Configure your mongodb dsn (full)
- Run 'npm test'
