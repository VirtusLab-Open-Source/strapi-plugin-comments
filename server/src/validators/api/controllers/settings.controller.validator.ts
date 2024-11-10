import { z } from "zod";
import { schemaConfig } from "../../../config";
import { validate } from "../../utils";

export const validateConfig = (config: unknown) => {
  return validate(schemaConfig.safeParse(config));
};

export type CommentsPluginConfig = z.infer<typeof schemaConfig>;
