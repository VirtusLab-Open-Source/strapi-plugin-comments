import pluginId from '../pluginId';

const getApiURL = endPoint => `/${pluginId}/${endPoint}`;

export default getApiURL;