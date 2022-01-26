module.exports = ({ nexus }) => nexus.objectType({
  name: "CommentAuthorUser",
  definition(t) {
    t.id("id")
    t.nonNull.string("firstName")
    t.string("lastName")
    t.string("email")
  }
})