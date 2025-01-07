import { useIntl } from "react-intl";
import { pluginId } from "../pluginId";

const getMessage = (
  input: any,
  defaultMessage = "",
  inPluginScope = true,
) => {
  const { formatMessage } = useIntl();
  let formattedId = "";
  if (typeof input === 'string') {
    formattedId = input;
  } else {
    formattedId = input?.id.toString() || formattedId;
  }
  return formatMessage(
    {
      id: `${inPluginScope ? pluginId : "app.components"}.${formattedId}`,
      defaultMessage,
    },
    typeof input === 'string' ? undefined : input?.props,
  );
};

export default getMessage;
