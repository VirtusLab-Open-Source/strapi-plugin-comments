import { z } from 'zod';
import { REPORT_REASON } from '../const';

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
  enabledCollections: z.array(z.string()),
  moderatorRoles: z.array(z.string()),
  approvalFlow: z.array(z.string()),
  entryLabel: z.record(z.array(z.string())),
  reportReasons: reportReasonsSchema.optional().nullable(),
  blockedAuthorProps: z.array(z.string()),
  isGQLPluginEnabled: z.boolean().optional(),
});

export type CommentsPluginConfig = z.infer<typeof schemaConfig>;

const config = {
  default: schemaConfig.parse(defaultPluginConfig),
  validate: (config: unknown) => {
    console.log('validate::config', config);
    return schemaConfig.safeParse(config);
  },
} as const;

export default config;
