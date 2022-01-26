module.exports = ({ nexus }) => nexus.inputObjectType({
  name: "RemoveComment",
  definition(t) {
    t.id("id")
    t.nonNull.string("relation")
    t.field("author", { type: 'IdentifyCommentAuthor' })
  }
})