import { opine, serveStatic } from "https://deno.land/x/opine/mod.ts";
import { Language, minify } from "https://deno.land/x/minifier/mod.ts";
import {
  ensureDirSync,
  ensureFileSync,
  existsSync,
  walkSync,
} from "https://deno.land/std/fs/mod.ts";

const tempFolder = `${Deno.cwd()}/temp`;
let weatherCache = "";
let weatherTimeOut = new Date().getTime();

export async function startServer(): Promise<void> {
  // Create web server
  const app = opine();

  // Add resource folder
  app.use(serveStatic(tempFolder));

  // Add route for weather
  app.get("/weather", async (req, res) => {
    if (new Date().getTime() >= weatherTimeOut) {
      const lat = "21.0425886";
      const lon = "105.8129389";
      const apiKey = "7b093bee7461b669e34c363d887cfdec";
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
      weatherCache = await response.json();
      weatherTimeOut = new Date().getTime() + 1800000;
    }
    res.send(weatherCache);
  });

  // Minify all files and copy to temp folder
  await Compile();

  // Start web server
  app.listen(7001, () =>
    console.log(
      `Server has started on http://localhost:7001 🚀`,
    ));
}

export async function Compile(): Promise<void> {
  ensureDirSync(tempFolder);

  [`private/themes/${window.config.website.theme}`, "public"].forEach(
    (folder) => {
      for (
        const entry of walkSync(`${Deno.cwd()}/${folder}/`, {
          includeDirs: false,
        })
      ) {
        console.log("Preparing: " + entry.path);

        let language = null;
        if (!entry.path.includes(".min.")) {
          if (entry.path.includes(".css")) {
            language = Language.CSS;
          } else if (entry.path.includes(".json")) {
            language = Language.JSON;
          }
          // minifier module make error when minify js and html file 🥲
          //else if (entry.path.includes(".js")) {
          //  language = Language.JS;
          //}
          //else if (entry.path.includes(".htm")) {
          //language = Language.HTML;
          //}
        }

        const moveToPath = convertOutputPath(entry.path, folder);
        ensureFileSync(moveToPath);

        if (language) {
          let content = Deno.readTextFileSync(entry.path);
          content = minify(Language.HTML, content);
          Deno.writeTextFileSync(moveToPath, content);
        } else {
          Deno.copyFileSync(entry.path, moveToPath);
        }
      }
    },
  );
  // Copy language
  let languagePath =
    `${Deno.cwd()}/public/languages/${window.config.website.language}.json`;
  const languageOutput = convertOutputPath(languagePath, "public/languages");
  if (!existsSync(languagePath)) {
    languagePath =
      `${Deno.cwd()}/private/languages/${window.config.website.language}.json`;
  }
  Deno.copyFileSync(languagePath, languageOutput);
}

function convertOutputPath(path: string, from: string) {
  return Deno.cwd() + path.replace(Deno.cwd(), "").replace(from, "temp");
}
