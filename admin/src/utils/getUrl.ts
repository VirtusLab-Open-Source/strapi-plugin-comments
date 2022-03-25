import { pluginId } from "../pluginId";

const getUrl = (path = "") => `/plugins/${pluginId}/${path}`;

export default getUrl;
