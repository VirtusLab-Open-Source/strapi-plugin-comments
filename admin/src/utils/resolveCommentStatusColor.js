import { isNil } from 'lodash';
import { COMMENT_STATUS } from './constants';

const resolveCommentStatusColor = (status) => {
    if (Object.keys(COMMENT_STATUS).includes(status)) {
        switch (status) {
            case COMMENT_STATUS.REMOVED:
                return 'secondary';
            case COMMENT_STATUS.TO_REVIEW:
            case COMMENT_STATUS.REJECTED:
                return 'warning';
            case COMMENT_STATUS.BLOCKED:
                return 'danger';
            case COMMENT_STATUS.OPEN:
            case COMMENT_STATUS.APPROVED:
                return 'success';
        };
    }
    return 'secondary';
}

export default resolveCommentStatusColor;
