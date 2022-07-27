/**
 *
 * Avatar
 *
 */

// @ts-nocheck

import React from "react";
import PropTypes from "prop-types";
import { isObject } from "lodash";
import { Avatar, Initials } from "@strapi/design-system/Avatar";
import { renderInitials } from "../../utils";

const UserAvatar = ({ avatar, name }) => {
  if (avatar) {
    let image = avatar;
    if (isObject(avatar)) {
      image = avatar?.formats?.thumbnail.url || avatar.url;
    }
    return image && (<Avatar src={image} alt={name} />);
  }
  return name && (<Initials>{renderInitials(name)}</Initials>);
};

UserAvatar.propTypes = {
  avatar: PropTypes.oneOfType(PropTypes.string, PropTypes.object).isRequired,
  name: PropTypes.string,
};

export default UserAvatar;
