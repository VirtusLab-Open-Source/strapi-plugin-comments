import { INexusType, StrapiGraphQLContext } from "../../../types"

export = ({ nexus }: StrapiGraphQLContext) => nexus.inputObjectType({
  name: "IdentifyCommentAuthor",
  definition(t: INexusType) {
    t.nonNull.id("id")
  }
})