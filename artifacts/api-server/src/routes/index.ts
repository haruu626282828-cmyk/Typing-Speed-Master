import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resultsRouter from "./results";
import statsRouter from "./stats";
import leaderboardRouter from "./leaderboard";
import achievementsRouter from "./achievements";
import passagesRouter from "./passages";
import dailyRouter from "./daily";

const router: IRouter = Router();

router.use(healthRouter);
router.use(resultsRouter);
router.use(statsRouter);
router.use(leaderboardRouter);
router.use(achievementsRouter);
router.use(passagesRouter);
router.use(dailyRouter);

export default router;
