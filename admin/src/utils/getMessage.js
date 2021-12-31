
import { useIntl } from 'react-intl';

import pluginId from '../pluginId';

const getMessage = (id, defaultMessage, inPluginScope = true) => {
    const { formatMessage } = useIntl();
    return formatMessage({
        id: `${inPluginScope ? pluginId : 'app.component'}.${id}`,
        defaultMessage,
    })
};

export default getMessage;
