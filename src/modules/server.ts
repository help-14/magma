import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { ensureDirSync, existsSync } from "https://deno.land/std/fs/mod.ts";
import { Language, minify } from "https://deno.land/x/minifier/mod.ts";

const tempFolder = `${Deno.cwd()}/temp`;

export async function startServer(): Promise<void> {
  const router = new Router();
  router
    .get("/", (context) => {
      context.response.body = window.index;
    });

  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(async (context, next) => {
    try {
      await context.send({
        root: `${Deno.cwd()}/public`,
      });
    } catch {
      next();
    }
  });

  await app.listen({ port: window.config.server.port });
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
  indexContent = minify(Language.HTML, indexContent);

  //Write index.html into temp folder
  ensureDirSync(tempFolder);
  await Deno.writeTextFile(`${tempFolder}/index.html`, indexContent);
}

export async function CompileCSS(path: string): Promise<void> {
}

export async function CompileJS(path: string): Promise<void> {
}
