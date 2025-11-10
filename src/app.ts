import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { PORT } from "./config/env";
// import { ErrorHandler } from "./helpers/response.handler";

export class App {
    private app: Application;

    constructor() {
        this.app = express();
        this.middlewares();
        // this.routes();
        this.handleErrors();
    }

    private middlewares() {
        this.app.use(express.json());
        this.app.use(cors());
        // this.app.use(express.static(path.join(__dirname, "../public")));
    }

    private routes() {
        // this.app.use("/api/v1/auth", "Hello World");
    }

    private handleErrors() {
        // Not found handler
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.status(404).send("Not found !");
        });

        // Error handler
        this.app.use(
            (err: any, req: Request, res: Response, next: NextFunction) => {
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
