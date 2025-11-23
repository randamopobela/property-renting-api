import { App } from "./app";
import { startCronJob } from "./utils/scheduler.util";

const app = new App();
app.start();

startCronJob();
