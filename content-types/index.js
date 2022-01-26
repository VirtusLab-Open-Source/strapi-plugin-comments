const CommentCT = require('./comment');
const ReportCT = require('./report');

module.exports = {
  'comment': {
    schema: CommentCT,
  },
  'comment-report': {
    schema: ReportCT,
  }, 
};
