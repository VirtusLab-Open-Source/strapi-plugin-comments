import { first, isString } from "lodash";

const renderInitials = (value = "") => isString(value) ?
  value
    .split(" ")
    .map((_) => first(_))
    .join("")
    .toUpperCase() : "";

export default renderInitials;
