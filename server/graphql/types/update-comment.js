module.exports = ({ nexus }) => nexus.inputObjectType({
  name: "UpdateComment",
  definition(t) {
    t.id("id")
    t.nonNull.string("content")
    t.nonNull.string("relation")
    t.field("author", { type: 'IdentifyCommentAuthor' })
  }
})