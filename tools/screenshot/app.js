const puppeteer = require('puppeteer');
const { readdirSync, copyFileSync, mkdirSync, existsSync } = require('fs');
const { exec } = require('child_process');

const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

const replaceFiles = (source, destination) =>
    readdirSync(source, { withFileTypes: true })
        .forEach(path => {
            const srcPath = `${source}/${path.name}`
            const desPath = `${destination}/${path.name}`
            if (path.isDirectory()) {
                if (!existsSync(desPath)) mkdirSync(desPath, { recursive: true });
                replaceFiles(srcPath, desPath);
            }
            else
                copyFileSync(srcPath, desPath)
        });

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    exec('cd ../../src/ && go run main.go');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });

    const themes = getDirectories("../../sample");
    for (const theme of themes) {
        replaceFiles(`../../sample/${theme}`, '../../src/data');
        await sleep(2000);

        const page = await browser.newPage();
        await page.goto('http://localhost:7001');
        await page.waitForNetworkIdle();
        await sleep(1000);
        await page.screenshot({ path: `../../docs/screenshots/${theme}.png` });
        await page.close();
    }

    browser.close();
})();
