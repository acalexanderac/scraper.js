const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: 'YOUR_2CAPTCHA_API_KEY'
        }
    })
);

async function solveCaptcha(page) {
    await page.solveRecaptchas();
} 