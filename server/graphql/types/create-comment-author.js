module.exports = ({ nexus }) => nexus.inputObjectType({
  name: "CreateCommentAuthor",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.string("name")
    t.string("email")
    t.string("avatar")
  }
})