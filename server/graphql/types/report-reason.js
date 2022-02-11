const { getPluginService } = require("../../utils/functions");


module.exports = ({ nexus }) => nexus.enumType({
  name: "ReportReason",
  description: 'Reason of abuse report',
  members: {
    ...await getPluginService('common').getConfig('reportReasons', {})
  },
})