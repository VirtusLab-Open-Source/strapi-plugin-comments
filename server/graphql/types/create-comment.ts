import { INexusType, StrapiGraphQLContext } from "../../../types"

export = ({ nexus }: StrapiGraphQLContext) => nexus.inputObjectType({
  name: "CreateComment",
  definition(t: INexusType) {
    t.nonNull.string("content")
    t.nonNull.string("relation")
    t.id("threadOf")
    t.field("author", { type: 'CreateCommentAuthor' })
  }
})