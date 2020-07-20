import { ModalFooter as StrapiModalFooter, colors } from 'strapi-helper-plugin';

import styled from 'styled-components';

const ModalFooter = styled(StrapiModalFooter)`
      section {
        justify-content: flex-end;
        &:last-of-type {
            justify-content: flex-end;
        }

        label {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            padding: 0;
            margin: 0;

            color: ${colors.leftMenu.darkGrey};
            font-weight: 600;
            font-style: italic;
        }

        button {
            margin-left: 1rem;
        }
    }
`;

export default ModalFooter;