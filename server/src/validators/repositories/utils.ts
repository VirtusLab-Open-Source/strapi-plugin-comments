import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  total: z.number(),
});

export type Pagination = z.infer<typeof paginationSchema>

export const shouldValidateObject = <T extends z.ZodRawShape>(isValidateEnabled: boolean, validator: z.ZodObject<T>) =>
  (value: unknown): Promise<z.ZodObject<T>['_output']> => {
    return (isValidateEnabled ? validator.parseAsync(value) : Promise.resolve(value as T)) as Promise<z.ZodObject<T>['_output']>;
  };

export const shouldValidateArray = <T extends z.ZodTypeAny>(isValidateEnabled: boolean, validator: z.ZodArray<T>) =>
  (value: unknown): Promise<z.ZodArray<T>['_output']> => {
    return isValidateEnabled ? validator.parseAsync(value) : Promise.resolve(value as T) as Promise<z.ZodArray<T>['_output']>;
  };
