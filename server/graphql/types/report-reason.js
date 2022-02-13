module.exports = ({ nexus, config }) => {
  const { reportReasons } = config;
  return nexus.enumType({
    name: "ReportReason",
    description: 'Reason of abuse report',
    members: {
      ...reportReasons
    },
  })
};
