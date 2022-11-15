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
import { AdminAvatarWrapper, AdminShield } from "./styles";
import {Shield} from "@strapi/icons";
import {Icon} from "@strapi/design-system/Icon";
import { IntlContext } from "react-intl";



const UserAvatar = ({ avatar, name, isAdminComment }) => {
  if (avatar) {
    let image = avatar;
    if (isObject(avatar)) {
      image = avatar?.formats?.thumbnail.url || avatar.url;
    }
    if(isAdminComment){
      return (
          <AdminAvatarWrapper>
            <AdminShield>
            <Icon as={Shield} color="neutral800"/>
            </AdminShield>
            {image && (<Avatar src={image} alt={name} />)}
          </AdminAvatarWrapper>
      )
    }
    return image && (<Avatar src={image} alt={name} />);
  }
  if(isAdminComment){
    return(
    <AdminAvatarWrapper>
      <AdminShield>
      <Icon as={Shield} color="neutral800"/>
      </AdminShield>
      {name && (<Initials>{renderInitials(name)}</Initials>)}
    </AdminAvatarWrapper>
    )
  }
  return name && (<Initials>{renderInitials(name)}</Initials>);
};

UserAvatar.propTypes = {
  avatar: PropTypes.oneOfType(PropTypes.string, PropTypes.object).isRequired,
  name: PropTypes.string,
  isAdminComment: PropTypes.bool,
};

export default UserAvatar;
