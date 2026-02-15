import { BlogPostRouter } from './routers/blog';
import { createCallerFactory, publicProcedure, router } from './trpc';
 
export const appRouter = router({
  blog: BlogPostRouter,
  //test: publicProcedure.query(async () => { return [10,20,30]; })
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
 
