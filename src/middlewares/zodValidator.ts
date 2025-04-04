import type { Context, Next } from 'hono';
import { z } from 'zod';

type ValidatorConfig = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

type ValidatorResult<T extends ValidatorConfig> = {
  body: T['body'] extends z.ZodType ? z.infer<T['body']> : never;
  params: T['params'] extends z.ZodType ? z.infer<T['params']> : never;
  query: T['query'] extends z.ZodType ? z.infer<T['query']> : never;
};

declare module 'hono' {
  interface ContextVariables {
    validator: Partial<ValidatorResult<any>>;
  }
}

export const zodValidator = <T extends ValidatorConfig>(config: T) => {
  return async (c: Context, next: Next) => {
    const result: Partial<ValidatorResult<T>> = {};

    try {
      if (config.body) {
        const data = await c.req.json();
        result.body = await config.body.parseAsync(data);
      }

      if (config.query) {
        const query = Object.fromEntries(new URL(c.req.url).searchParams);
        result.query = await config.query.parseAsync(query);
      }

      if (config.params) {
        result.params = await config.params.parseAsync(c.req.param());
      }

      c.set('validator', result);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            error: 'Validation failed',
            details: error.errors,
          },
          400
        );
      }
      throw error;
    }
  };
};
