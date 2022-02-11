module.exports = ({ nexus, config }) => {
  const { reportReasons } = config;
  console.log('reportReasons', reportReasons);
  return nexus.enumType({
    name: "ReportReason",
    description: 'Reason of abuse report',
    members: {
      ...reportReasons
    },
  })
};
