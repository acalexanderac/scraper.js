const devices = {
    desktop: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 }
    },
    iphone: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
        viewport: { width: 375, height: 812 }
    },
    android: {
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        viewport: { width: 412, height: 915 }
    }
};

async function randomDeviceScraper(url) {
    const device = devices[Object.keys(devices)[Math.floor(Math.random() * Object.keys(devices).length)]];
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setUserAgent(device.userAgent);
    await page.setViewport(device.viewport);
} 