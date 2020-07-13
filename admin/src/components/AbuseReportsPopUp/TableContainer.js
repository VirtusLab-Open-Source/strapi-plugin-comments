import { colors } from 'strapi-helper-plugin';

import styled from 'styled-components';

const TableContainer = styled.div`
    table {
        thead {
            tr {
                border-bottom: 1px ${colors.grey} solid;

                td {
                    background: transparent;

                    &:first-child {
                        padding-left: 0;
                    }

                    &:last-child {
                        padding-right: 0;
                    }
                }
            }
        }

        tbody {
            tr {
                background-color: white;

                td {
                    &:first-child {
                        padding-left: 0;
                    }

                    &:last-child {
                        padding-right: 0;
                    }
                }

                &:last-child {
                    border-bottom: 0;
                }

                &:hover {
                    background-color: white;

                    cursor: default;
                }
            }
        }

        p {
            margin: 0;
            padding: 0;
        }
    }

    &>div {
        box-shadow: none;
        border: 0;
    }
`;

export default TableContainer;