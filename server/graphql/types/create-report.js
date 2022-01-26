module.exports = ({ nexus }) => nexus.inputObjectType({
  name: "CreateReport",
  definition(t) {
    t.id("commentId")
    t.nonNull.string("relation")
    t.nonNull.string("content")
    t.field("reason", { type: 'ReportReason' })
  }
})