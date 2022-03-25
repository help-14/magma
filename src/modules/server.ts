import { opine, serveStatic } from "https://deno.land/x/opine/mod.ts";
import { Language, minify } from "https://deno.land/x/minifier/mod.ts";
import {
  ensureDirSync,
  ensureFileSync,
  existsSync,
  walkSync,
} from "https://deno.land/std/fs/mod.ts";

const tempFolder = `${Deno.cwd()}/temp`;

export async function startServer(): Promise<void> {
  // Create web server
  const app = opine();

  // Add resource folder
  app.use(serveStatic(tempFolder));

  // Add route for index page
  app.get("/", (req, res) => {
    res.headers = new Headers({
      "content-type": "text/html; charset=UTF-8",
    });
    res.send(window.index);
  });

  // Add route for weather
  app.get("/weather", async (req, res) => {
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
    res.send(response);
  });

  await Compile();
  app.listen(7000, () =>
    console.log(
      `server has started on http://localhost:7000 🚀`,
    ));
}

export async function Compile(): Promise<void> {
  ensureDirSync(tempFolder);

  ["private", "public"].forEach((folder) => {
    for (
      const entry of walkSync(`${Deno.cwd()}/${folder}/`, {
        includeDirs: false,
      })
    ) {
      console.log(entry.path);
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

      const moveToPath = changePath(entry.path, folder, "temp");
      ensureFileSync(moveToPath);

      if (language) {
        let content = Deno.readTextFileSync(entry.path);
        content = minify(Language.HTML, content);
        Deno.writeTextFileSync(moveToPath, content);
      } else {
        Deno.copyFileSync(entry.path, moveToPath);
      }
    }
  });
}

export async function CompileIndex(): Promise<void> {
  //Read index.html content
  let indexPath = `${tempFolder}/index.html`;
  let indexContent = Deno.readTextFileSync(indexPath);

  //Insert config into template
  // for (let property in window.config.website) {
  //   indexContent = indexContent.replace(
  //     `{{${property}}}`,
  //     window.config.website[property],
  //   );
  // }

  //Insert localization into template
  // for (let key in window.language) {
  //   indexContent = indexContent.replace(`{%${key}%}`, window.language[key]);
  // }

  //Write index.html into temp folder
  //ensureDirSync(tempFolder);
  window.index = indexContent;
  //Deno.writeTextFileSync(`${tempFolder}/index.html`, indexContent);
}

function changePath(path: string, from: string, to: string) {
  return Deno.cwd() + path.replace(Deno.cwd(), "").replace(from, to);
}
