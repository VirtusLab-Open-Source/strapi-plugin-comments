// @ts-ignore
import { Icon } from "@strapi/design-system/Icon";
import styled from "styled-components";
// @ts-ignore
import { Box } from "@strapi/design-system/Box";
// @ts-ignore
import { Avatar, Initials } from "@strapi/design-system/Avatar";

export const AdminAvatarWrapper = styled(Box)`
    position: relative;
`;

export const AdminShield = styled(Box)`
    display: flex;
    align-items: middle;

    position: absolute;
    right: -35%;
    top: -35%;

    border-radius: 50%;
    border: 2px #ffffff solid;

    background: #ffffff;
`;