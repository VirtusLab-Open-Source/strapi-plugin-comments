import { pluginId } from "../pluginId";

const getApiURL = (endPoint: string) => `/${pluginId}/${endPoint}`;

export default getApiURL;
