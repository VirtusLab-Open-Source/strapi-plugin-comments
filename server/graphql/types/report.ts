import { INexusType, StrapiGraphQLContext } from "../../../types"

export = ({ nexus }: StrapiGraphQLContext) => nexus.objectType({
  name: "Report",
  definition(t: INexusType) {
    t.id("id")
    t.nonNull.string("content")
    t.field("reason", { type: 'ReportReason' })
    t.field("related", { type: 'CommentSingle' })
    t.string("createdAt")
    t.string("updatedAt")
  }
})