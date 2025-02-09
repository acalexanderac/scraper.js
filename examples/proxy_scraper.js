const proxyChain = require('proxy-chain');

async function setupProxyScraper() {
    const proxyList = [
        'http://proxy1.example.com:8080',
        'http://proxy2.example.com:8080',
        // Añadir más proxies
    ];

    const browser = await puppeteer.launch({
        args: [
            `--proxy-server=${proxyList[Math.floor(Math.random() * proxyList.length)]}`,
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });
} 