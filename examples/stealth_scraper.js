const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function stealthScraper() {
    const browser = await puppeteer.launch({
        args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-features=site-per-process',
            '--disable-dev-shm-usage'
        ],
        ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();
    
    // Ocultar webdriver
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
        window.chrome = {};
        window.navigator.languages = ['en-US', 'en'];
    });
} 