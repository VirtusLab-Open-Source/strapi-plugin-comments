
export default {
  render: (uid: string) => `plugin::comments.${uid}`,
  comments: {
    read: "comments-read",
    moderate: "comments-moderate",
  },
  reports: {
    read: "reports-read",
    review: "reports-review",
  },
  settings: {
    read: "settings-read",
    change: "settings-change",
  },
};
