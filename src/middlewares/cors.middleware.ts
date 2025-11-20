import { CorsOptions } from "cors";
import { clientURL } from "../config/env";

const corsOptions: CorsOptions = {
    origin: clientURL,
    credentials: true,
};

export default corsOptions;
