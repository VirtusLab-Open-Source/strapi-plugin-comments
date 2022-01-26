module.exports = ({ nexus }) => nexus.objectType({
  name: "CommentAuthor",
  definition(t) {
    t.id("id")
    t.nonNull.string("name")
    t.string("email")
    t.string("avatar")
  }
})