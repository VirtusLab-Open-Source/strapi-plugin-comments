import { REPORT_STATUS } from "./constants";

const resolveReportStatusColor = (status: keyof typeof REPORT_STATUS) => {
  switch (status) {
    case REPORT_STATUS.PENDING:
      return "primary";
    case REPORT_STATUS.RESOLVED:
      return "success";
    case REPORT_STATUS.BLOCKED:
      return "danger";
    default:
      return "primary";
  }
};

export default resolveReportStatusColor;
