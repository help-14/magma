import { Config, loadConfig } from "./modules/config.ts";
import { startServer } from "./modules/server.ts";
import { Language } from "./modules/language.ts";

declare global {
  var config: Config;
  var index: string;
  var language: Language;
  interface Window {
    config: any;
    index: string;
    language: any;
  }
}

window.config = await loadConfig();
if (window.config === null) {
  console.error("Failed to load config file.");
  console.info("Using default config.");
  window.config = new Config();
}

startServer();
