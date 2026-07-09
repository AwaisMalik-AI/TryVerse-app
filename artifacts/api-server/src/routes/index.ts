import { Router, type IRouter } from "express";
import healthRouter from "./health";
import savedLooksRouter from "./saved-looks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(savedLooksRouter);

export default router;
