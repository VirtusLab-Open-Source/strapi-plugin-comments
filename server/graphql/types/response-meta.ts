import { INexusType, StrapiGraphQLContext } from "../../../types"

export = ({ nexus }: StrapiGraphQLContext) => nexus.objectType({
  name: "ResponseMeta",
  definition(t: INexusType) {
    t.field("pagination", { type: 'ResponsePagination' })
  }
})