import React from "react";
import { AdminAvatarWrapper, AdminShield } from "./styles";
// @ts-ignore
import {Shield} from "@strapi/icons";
// @ts-ignore
import {Icon} from "@strapi/design-system/Icon";
import { ToBeFixed } from "../../../../types";

const AdminAvatar = ({ children }: ToBeFixed ) => {
    return ( 
        <AdminAvatarWrapper>
            <AdminShield>
                <Icon as={Shield} color="neutral800"/>
            </AdminShield>
            {children}
        </AdminAvatarWrapper>
     );
}
 
export default AdminAvatar;