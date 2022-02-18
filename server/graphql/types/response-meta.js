module.exports = ({ nexus }) => nexus.objectType({
  name: "ResponseMeta",
  definition(t) {
    t.field("pagination", { type: 'ResponsePagination' })
  }
})