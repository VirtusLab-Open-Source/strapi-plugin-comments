import React from "react";
import { AdminAvatarWrapper, AdminShield } from "./styles";
// @ts-ignore
import {Shield} from "@strapi/icons";
// @ts-ignore
import {Icon} from "@strapi/design-system/Icon";

const AdminAvatar: React.FC<React.PropsWithChildren<{}>>  = ({ children } ) => {
    return ( 
        <AdminAvatarWrapper>
            {children}
            <AdminShield>
                <Icon as={Shield} color="neutral800"/>
            </AdminShield>
        </AdminAvatarWrapper>
     );
}
 
export default AdminAvatar;