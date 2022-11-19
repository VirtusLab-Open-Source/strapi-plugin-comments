/**
 *
 * Avatar
 *
 */

// TODO
// @ts-nocheck

import React from "react";
import PropTypes from "prop-types";
import { isObject } from "lodash";
import { Avatar, Initials } from "@strapi/design-system/Avatar";
import { renderInitials } from "../../utils";
import { IntlContext } from "react-intl";
import AdminAvatar from "../AdminAvatar";

const UserAvatar = ({ avatar, name, isAdminComment }) => {
  if (avatar) {
    let image = avatar;
    if (isObject(avatar)) {
      image = avatar?.formats?.thumbnail.url || avatar.url;
    }
      return(
        isAdminComment ? <AdminAvatar>{image && (<Avatar src={image} alt={name} />)}</AdminAvatar>
        : image && (<Avatar src={image} alt={name} />))
      }
  return(
    isAdminComment ? <AdminAvatar>{name && (<Initials>{renderInitials(name)}</Initials>)}</AdminAvatar>
    : name && (<Initials>{renderInitials(name)}</Initials>)
  ) 
};

UserAvatar.propTypes = {
  avatar: PropTypes.oneOfType(PropTypes.string, PropTypes.object).isRequired,
  name: PropTypes.string,
};

export default UserAvatar;
