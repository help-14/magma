export class Config {
  website: WebsiteConfig = new WebsiteConfig();
  addons: string[] = [];
}

class WebsiteConfig {
  public title: string = "";
  public description: string = "";
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
