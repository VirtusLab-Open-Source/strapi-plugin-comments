import { ToBeFixed } from "./types/common";

export default {
  render: (uid: ToBeFixed) => `plugin::comments.${uid}`,
  comments: {
    read: "read",
    moderate: "moderate",
  },
  reports: {
    read: "reports.read",
    action: "reports.action",
  },
  settings: {
    read: "settings.read",
    change: "settings.change",
  },
};
