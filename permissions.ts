'use strict';

import { ToBeFixed } from "./types/common";

export default {
    render: function(uid: ToBeFixed) {
        return `plugin::comments.${uid}`;
    },
    comments: {
        read: 'read',
        moderate: 'moderate',
    },
    reports: {
        read: 'reports.read',
        action: 'reports.action',
    },
    settings: {
        read: 'settings.read',
        change: 'settings.change',
    },
};