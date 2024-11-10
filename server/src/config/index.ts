import { z } from 'zod';
import { REPORT_REASON } from '../const';
import { CONFIG_PARAMS } from '../utils/constants';

const defaultPluginConfig: CommentsPluginConfig = {
  isValidationEnabled: true,
  enabledCollections: [],
  moderatorRoles: [],
  approvalFlow: [],
  entryLabel: {
    '*': ['Title', 'title', 'Name', 'name', 'Subject', 'subject'],
  },
  reportReasons: {
    BAD_LANGUAGE: REPORT_REASON.BAD_LANGUAGE,
    DISCRIMINATION: REPORT_REASON.DISCRIMINATION,
    OTHER: REPORT_REASON.OTHER,
  },
  blockedAuthorProps: [],
};

const reportReasonsSchema = z.object({
  [REPORT_REASON.BAD_LANGUAGE]: z.literal(REPORT_REASON.BAD_LANGUAGE),
  [REPORT_REASON.OTHER]: z.literal(REPORT_REASON.OTHER),
  [REPORT_REASON.DISCRIMINATION]: z.literal(REPORT_REASON.DISCRIMINATION),
});

export const schemaConfig = z.object({
  isValidationEnabled: z.boolean().optional(),
  reportReasons: reportReasonsSchema.optional(),
  isGQLPluginEnabled: z.boolean().optional(),
  [CONFIG_PARAMS.ENABLED_COLLECTIONS]: z.array(z.string()),
  [CONFIG_PARAMS.MODERATOR_ROLES]: z.array(z.string()),
  [CONFIG_PARAMS.APPROVAL_FLOW]: z.array(z.string()),
  [CONFIG_PARAMS.ENTRY_LABEL]: z.record(z.array(z.string())),
  [CONFIG_PARAMS.BAD_WORDS]: z.boolean().optional(),
  [CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS]: z.array(z.string()),
});

export type CommentsPluginConfig = z.infer<typeof schemaConfig>;

const config = {
  default: schemaConfig.parse(defaultPluginConfig),
  validate: (config: unknown) => {
    return schemaConfig.safeParse(config);
  },
} as const;

export default config;
