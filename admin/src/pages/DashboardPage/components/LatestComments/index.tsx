//@ts-nocheck

import React from 'react';
import {
    Layout,
    HeaderLayout,
    ActionLayout,
    ContentLayout,
} from '@strapi/design-system/Layout';
import {Table, Thead, Tbody, Tr, Th, Td} from '@strapi/design-system/Table';
import {Typography} from '@strapi/design-system/Typography';
import {VisuallyHidden} from '@strapi/design-system/VisuallyHidden';
import DiscoverTableRow from '../../../Discover/components/DiscoverTableRow';
import { getMessage } from '../../../../utils';

const COL_COUNT = 8;

const LatestComments = ({ data, handleClick, allowedActions, config }) => {

    return ( 
        <Layout>
            <HeaderLayout
                  title="Latest Comments"
                  as="h3"
                />
                      <Table colCount={COL_COUNT} rowCount={data.length}>
                        <Thead>
                          <Tr>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage("page.discover.table.header.id")}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.author",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.message",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.thread",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage("page.discover.table.header.entry")}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.lastUpdate",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <Typography variant="sigma">
                                {getMessage(
                                  "page.discover.table.header.status",
                                )}
                              </Typography>
                            </Th>
                            <Th>
                              <VisuallyHidden>
                                {getMessage(
                                  "page.discover.table.header.actions",
                                )}
                              </VisuallyHidden>
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {
                          data.slice(0,5).map((entry) => (
                            <DiscoverTableRow
                              key={`comment-${entry.id}`}
                              config={config}
                              item={entry}
                              allowedActions={allowedActions}
                              onClick={handleClick}
                            />
                          ))}
                        </Tbody>
                      </Table>           
        </Layout>
     );
}
 
export default LatestComments;
