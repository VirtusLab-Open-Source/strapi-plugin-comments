import { StrapiGraphQLContext } from "../../../types";

export = ({ nexus, config }: StrapiGraphQLContext) => {
  const { reportReasons } = config;
  return nexus.enumType({
    name: "ReportReason",
    description: "Reason of abuse report",
    members: {
      ...reportReasons,
    },
  });
};
