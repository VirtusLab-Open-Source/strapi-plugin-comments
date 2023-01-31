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
import { ToBeFixed } from "../../../../types";

interface IProps {
  avatar: string | ToBeFixed;
  avatar: string | ToBeFixed;
  avatar: string | ToBeFixed;
  name: string;
  isAdminComment?: boolean;
}

const UserAvatar: React.FC<IProps> = ({
  avatar,
  name,
  isAdminComment = false,
}) => {
  if (avatar) {
    let image = avatar;

    if (isObject(avatar)) {
      image = avatar?.formats?.thumbnail.url || avatar.url;
    }

    return isAdminComment ? (
      <AdminAvatar>
        {image ? <Avatar src={image} alt={name} /> : null}
      </AdminAvatar>
    ) : image ? (
      <Avatar src={image} alt={name} />
    ) : null;
  }

  return isAdminComment ? (
    <AdminAvatar>
      {name ? <Initials>{renderInitials(name)}</Initials> : null}
    </AdminAvatar>
  ) : name ? (
    <Initials>{renderInitials(name)}</Initials>
  ) : null;
};

export default UserAvatar;
