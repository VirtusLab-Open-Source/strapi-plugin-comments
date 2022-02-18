module.exports = ({ nexus }) => nexus.objectType({
  name: "ResponsePagination",
  definition(t) {
    t.int('page')
    t.int('pageSize')
    t.int('pageCount')
    t.int('total')
    t.int('start')
    t.int('limit')
  }
})