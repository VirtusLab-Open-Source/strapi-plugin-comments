import { z } from 'zod';
import PluginError from '../../utils/PluginError';

const validator = z.object({
  enabledCollections: z.array(z.string()),
  moderatorRoles: z.array(z.string()),
  approvalFlow: z.array(z.string()),
  entryLabel: z.record(z.array(z.string())),
  reportReasons: z.object({
    BAD_LANGUAGE: z.string(),
    DISCRIMINATION: z.string(),
    OTHER: z.string(),
  }),
  blockedAuthorProps: z.array(z.string()),
  isGQLPluginEnabled: z.boolean().optional(),
});
export const validateConfig = (config: unknown) => {
  const result = validator.safeParse(config);
  if (!result.success) {
    const formatted = result.error.format();
    throw new PluginError(400, [
      formatted.enabledCollections?._errors.join('\n'),
      formatted.moderatorRoles?._errors.join('\n'),
      formatted.approvalFlow?._errors.join('\n'),
      formatted.entryLabel?._errors.join('\n'),
      formatted.reportReasons?._errors.join('\n'),
      formatted.blockedAuthorProps?._errors.join('\n'),
    ].filter(Boolean).join('\n'));
  }
  return {
    enabledCollections: result.data.enabledCollections!,
    moderatorRoles: result.data.moderatorRoles!,
    approvalFlow: result.data.approvalFlow!,
    entryLabel: result.data.entryLabel!,
    reportReasons: {
      BAD_LANGUAGE: result.data.reportReasons.BAD_LANGUAGE!,
      DISCRIMINATION: result.data.reportReasons.DISCRIMINATION!,
      OTHER: result.data.reportReasons.OTHER!,
    },
    blockedAuthorProps: result.data.blockedAuthorProps!,
  };
};
export type CommentsPluginConfig = z.infer<typeof validator>