import { INexusType, StrapiGraphQLContext } from "../../../types"

export = ({ nexus }: StrapiGraphQLContext) => nexus.inputObjectType({
  name: "CreateReport",
  definition(t: INexusType) {
    t.id("commentId")
    t.nonNull.string("relation")
    t.nonNull.string("content")
    t.field("reason", { type: 'ReportReason' })
  }
})