module.exports = ({ nexus }) => nexus.objectType({
  name: "Report",
  definition(t) {
    t.id("id")
    t.nonNull.string("content")
    t.field("reason", { type: 'ReportReason' })
    t.field("related", { type: 'CommentSingle' })
    t.string("createdAt")
    t.string("updatedAt")
  }
})