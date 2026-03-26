import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import conversationsRouter from "./conversations.js";
import messagesRouter from "./messages.js";
import adminRouter from "./admin.js";
import paymentsRouter from "./payments.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/conversations", conversationsRouter);
router.use("/messages", messagesRouter);
router.use("/admin", adminRouter);
router.use("/payments", paymentsRouter);

export default router;
