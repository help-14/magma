export class Config {
  server: ServerConfig = new ServerConfig();
  website: WebsiteConfig = new WebsiteConfig();
  addons: string[] = [];
}

class ServerConfig {
  port: number = 7000;
  minify: boolean = true;
}

class WebsiteConfig {
  public title: string = "";
  public description: string = "";
  public background: string = "#218c74";
  public accent: string = "#ffc107";
  public language: string = "en";
  public localization: string = "en-US";
}

export async function loadConfig(): Promise<Config | null> {
  try {
    const json = JSON.parse(await Deno.readTextFile("./people.json"));
    return json as Config;
  } catch (err) {
    console.error(err);
    return null;
  }
}
