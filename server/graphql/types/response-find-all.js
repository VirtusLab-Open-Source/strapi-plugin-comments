module.exports = ({ nexus }) => nexus.objectType({
  name: "ResponseFindAll",
  definition(t) {
    t.list.field("data", { type: 'CommentSingle' })
    t.field("meta", { type: 'ResponseMeta' })
  }
})