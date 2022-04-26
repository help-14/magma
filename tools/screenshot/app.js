const puppeteer = require('puppeteer');
const { readdirSync, copyFileSync } = require('fs');
const { exec } = require('child_process');

const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

const replaceFiles = (source, destination) =>
    readdirSync(source, { withFileTypes: true })
        .filter(dirent => !dirent.isDirectory())
        .forEach(file => copyFileSync(`${source}/${file.name}`, `${destination}/${file.name}`));

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });

    const themes = getDirectories("./config");
    for (const theme of themes) {
        replaceFiles(`./config/${theme}`, '../../src/data');
        exec('cd ../../src/ && go run main.go');
        await sleep(500);

        const page = await browser.newPage();
        await page.goto('http://localhost:7001');
        await page.waitForNetworkIdle();
        await page.screenshot({ path: `../../docs/screenshots/${theme}.png` });
        await page.close();

        exec('pkill -f go');
        exec('pkill -f main');
        await sleep(500);
    }

    browser.close();
})();
