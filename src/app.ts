import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
// import path from "path";
import { PORT } from "./config/env";
import { ErrorHandler } from "./helpers/response.handler";
import { authRouter } from "./modules/auth/auth.router";

import bookingRouter from "./routes/booking.route";

export class App {
    private app: Application;

    constructor() {
        this.app = express();
        this.middleware();
        this.routes();
        this.handleErrors();
        this.middleware();
        this.routes();
        this.handleErrors();
    }

    private middleware() {
        this.app.use(express.json());
        this.app.use(cors());
        // this.app.use(express.static(path.join(__dirname, "../public")));
    }

    private routes() {
        this.app.get("/", (req: Request, res: Response) => {
            res.send("Welcome to Property Renting API!");
        });

        this.app.use("/api/bookings", bookingRouter);
    
        // this.app.use("/api/auth", authRouter);
        this.app.use("/api/v1/auth", authRouter());

    }

    private handleErrors() {
        // Not found handler
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.status(404).send("Not found !");
        });

        // Error handler
        this.app.use(
            (err: any, req: Request, res: Response, next: NextFunction) => {
                // 1. Log error biar kelihatan di terminal
                console.error("🔥 ERROR:", err);

                // 2. Kirim response ke user
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
