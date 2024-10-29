import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  total: z.number(),
});