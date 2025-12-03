import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { PORT } from "./config/env";
import { ErrorHandler } from "./helpers/response.handler";
import { authRouter } from "./modules/auth/auth.router";
import bookingRouter from "./modules/booking/booking.router";
import tenantRouter from "./modules/tenant/tenant.router";
import reviewRouter from "./modules/review/review.router";
import reportRouter from "./modules/report/report.router";
import cronService from "./services/cron.service";

export class App {
    private app: Application;

    constructor() {
        this.app = express();
        this.middleware();
        this.routes();
        this.handleErrors();
        cronService.init();
    }

    private middleware() {
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use("/images", express.static(path.join(__dirname, "../public/images")));
    }

    private routes() {
        this.app.get("/", (req: Request, res: Response) => {
            res.send("Welcome to Property Renting API!");
        });
        this.app.use("/api/auth", authRouter());
        this.app.use("/api/bookings", bookingRouter);
        this.app.use("/api/tenant", tenantRouter);
        this.app.use("/api/reviews", reviewRouter);
        this.app.use("/api/reports", reportRouter);
    }

    private handleErrors() {
        // Not found handler
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.status(404).send("Not found !");
        });

        // Error handler
        this.app.use(
            (
                err: ErrorHandler,
                req: Request,
                res: Response,
                next: NextFunction
            ) => {
                console.error("🔥 ERROR:", err);
                res.status(err.code || 500).send({
                    message: err.message,
                });
            }
        );
    }

    start() {
        this.app.listen(PORT, () => {
            console.log(`Final Project is running on port ${PORT}`);
        });
    }
}
