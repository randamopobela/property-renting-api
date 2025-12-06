import { App } from "./app";
import cronService from "./services/cron.service";

const app = new App();
app.start();

cronService.init();
