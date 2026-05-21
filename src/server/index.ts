import { BlogPostRouter } from './routers/blog';
import { PortfolioRouter } from './routers/portfolio';
import { createCallerFactory, router } from './trpc';
 
export const appRouter = router({
  blog: BlogPostRouter,
  pf : PortfolioRouter,
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
 
