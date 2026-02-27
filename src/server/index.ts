import { BlogPostRouter } from './routers/blog';
import { PortfolioRouter } from './routers/portfolio';
import { PositionRouter } from './routers/position';
import { StrategyRouter } from './routers/strategy';
import { TradeRouter } from './routers/trade';
import { createCallerFactory, router } from './trpc';
 
export const appRouter = router({
  blog: BlogPostRouter,
  strategy : StrategyRouter,
  position : PositionRouter,
  pf : PortfolioRouter,
  trade : TradeRouter,
  //test: publicProcedure.query(async () => { return [10,20,30]; })
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
 
