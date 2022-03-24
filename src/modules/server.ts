import { opine, serveStatic } from "https://deno.land/x/opine/mod.ts";
import { ensureDirSync, existsSync } from "https://deno.land/std/fs/mod.ts";
import { Language, minify } from "https://deno.land/x/minifier/mod.ts";

const tempFolder = `${Deno.cwd()}/temp`;

export async function startServer(): Promise<void> {
  const app = opine();
  app.use(serveStatic("./public"));
  app.get("/", function (req, res) {
    res.headers = new Headers({
      "content-type": "text/html; charset=UTF-8",
    });
    res.send(window.index);
  });

  Compile();
  app.listen(
    window.config.server.port,
    () =>
      console.log(
        `server has started on http://localhost:${window.config.server.port} 🚀`,
      ),
  );
}

export async function Compile(): Promise<void> {
  ensureDirSync(tempFolder);
  await CompileIndex();
}

export async function CompileIndex(): Promise<void> {
  //Read index.html content
  let indexPath = `${Deno.cwd()}/public/index.html`;
  if (!existsSync(indexPath)) {
    indexPath = `${Deno.cwd()}/private/index.html`;
  }
  let indexContent = await Deno.readTextFile(indexPath);

  //Insert config into template
  for (let property in window.config.website) {
    indexContent = indexContent.replace(
      `{{${property}}}`,
      window.config.website[property],
    );
  }

  //Insert localization into template
  for (let key in window.language) {
    indexContent = indexContent.replace(`{%${key}%}`, window.language[key]);
  }

  //Minify HTML
  if (window.config.server.minify) {
    indexContent = minify(Language.HTML, indexContent);
  }

  //Write index.html into temp folder
  ensureDirSync(tempFolder);
  window.index = indexContent;
  //await Deno.writeTextFile(`${tempFolder}/index.html`, indexContent);
}

export async function CompileCSS(path: string): Promise<void> {
  if (!path) {
  }

  if (window.config.server.minify) {}
}

export async function CompileJS(path: string): Promise<void> {
  if (!path) {
  }

  if (window.config.server.minify) {}
}
