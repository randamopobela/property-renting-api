import { join } from "path";
import { readFileSync } from "fs";
import handlebars from "handlebars";

export const hbs = (fileName: string) => {
    const templatePath = join(__dirname, `../templates/${fileName}`);
    const templateSource = readFileSync(templatePath, "utf-8");
    return handlebars.compile(templateSource);
};
