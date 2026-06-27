import { BlogPostRouter } from './routers/blog';
import { GardenRouter } from './routers/garden';
import { PortfolioRouter } from './routers/portfolio';
import { createCallerFactory, router } from './trpc';
 
export const appRouter = router({
  blog: BlogPostRouter,
  pf : PortfolioRouter,
  schedule : GardenRouter,
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
 
