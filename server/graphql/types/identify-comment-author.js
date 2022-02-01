module.exports = ({ nexus }) => nexus.inputObjectType({
  name: "IdentifyCommentAuthor",
  definition(t) {
    t.nonNull.id("id")
  }
})