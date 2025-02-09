const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const proxyChain = require('proxy-chain');
const fs = require('fs').promises;

// Configurar plugins
puppeteer.use(StealthPlugin());
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: 'YOUR_2CAPTCHA_API_KEY'
        }
    })
);

// Configuración de dispositivos
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

// Lista de proxies
const proxyList = [
    'http://proxy-list.org/proxy1:8080',
    'http://proxy-list.org/proxy2:8080'
    // Añadir tus proxies reales aquí
];

// Función de delay mejorada con randomización
const delay = (min, max) => {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Simulación de comportamiento humano
async function simulateHumanBehavior(page) {
    // Movimientos aleatorios del mouse
    await page.mouse.move(
        Math.random() * page.viewport().width,
        Math.random() * page.viewport().height,
        { steps: 25 }
    );

    // Scroll aleatorio
    await page.evaluate(() => {
        window.scrollTo({
            top: Math.random() * document.body.scrollHeight,
            behavior: 'smooth'
        });
    });

    await delay(2000, 5000);
}

// Añadir más user agents realistas
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
];

/**
 * Scraper general usando Puppeteer
 * @param {string} url - URL del sitio web
 * @param {Object} selectors - Selectores CSS para extraer datos
 * @param {string} containerSelector - Selector del contenedor principal
 */
async function puppeteerScraper(url, selectors, containerSelector, useProxy = false) {
    try {
        const launchOptions = {
            headless: false, // Cambiar a false temporalmente para debug
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=site-per-process',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--start-maximized',
                '--lang=en-US,en'
            ],
            defaultViewport: null,
            ignoreHTTPSErrors: true
        };

        const browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        // Configurar evasión mejorada
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
        });

        // Configurar headers más realistas
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        });

        // Añadir delays más naturales
        await page.setDefaultNavigationTimeout(30000);
        await delay(2000, 5000);

        // Seleccionar dispositivo aleatorio
        const device = devices[Object.keys(devices)[Math.floor(Math.random() * Object.keys(devices).length)]];

        // Configurar el dispositivo
        await page.setUserAgent(device.userAgent);
        await page.setViewport(device.viewport);

        // Monitorear bloqueos
        page.on('response', async response => {
            const status = response.status();
            if (status === 403 || status === 429) {
                console.log(`Bloqueo detectado: ${status}`);
                // Implementar lógica de recuperación
            }
        });

        // Cargar cookies si existen
        try {
            const savedCookies = JSON.parse(await fs.readFile('./cookies.json'));
            await page.setCookie(...savedCookies);
        } catch (e) {
            console.log('No se encontraron cookies guardadas');
        }

        // Navegar a la página con sistema de reintentos
        let retries = 3;
        while (retries > 0) {
            try {
                await page.goto(url, { 
                    waitUntil: 'networkidle0',
                    timeout: 60000 
                });
                break;
            } catch (error) {
                retries--;
                if (retries === 0) throw error;
                await delay(5000, 10000);
            }
        }

        // Simular comportamiento humano
        await simulateHumanBehavior(page);

        // Verificar y resolver captchas
        const pageContent = await page.content();
        if (pageContent.includes('captcha') || pageContent.includes('robot')) {
            console.log('Detectado captcha. Intentando resolver...');
            await page.solveRecaptchas();
        }

        // Guardar cookies después de la navegación exitosa
        const cookies = await page.cookies();
        await fs.writeFile('./cookies.json', JSON.stringify(cookies));

        // Extraer datos
        const results = await page.evaluate((containerSelector, selectors) => {
            const items = [];
            const containers = document.querySelectorAll(containerSelector);

            containers.forEach(container => {
                const item = {};
                for (const [key, selector] of Object.entries(selectors)) {
                    if (typeof selector === 'object') {
                        const element = container.querySelector(selector.selector);
                        item[key] = element ? element.getAttribute(selector.attr) : null;
                    } else {
                        const element = container.querySelector(selector);
                        item[key] = element ? element.textContent.trim() : null;
                    }
                }
                items.push(item);
            });

            return items;
        }, containerSelector, selectors);

        await browser.close();
        return results;

    } catch (error) {
        console.error('Error detallado:', error);
        return [];
    }
}

// Ejemplo para Prensa Libre
async function scrapePrensaLibre() {
    const newsSelectors = {
        headline: '.story-title',
        summary: '.story-contents p',
        date: '.story-date'
    };

    console.log('Iniciando scraping de Prensa Libre...');
    const news = await puppeteerScraper(
        'https://www.prensalibre.com/',
        newsSelectors,
        'article'
    );
    console.log('Noticias encontradas:', news);
}

// Ejemplo para Reddit
async function scrapeReddit() {
    const redditSelectors = {
        title: 'h3',
        votes: '[id^="vote-arrows"]',
        author: 'a[href^="/user/"]'
    };

    console.log('Iniciando scraping de Reddit...');
    const posts = await puppeteerScraper(
        'https://www.reddit.com/',
        redditSelectors,
        'div[data-testid="post-container"]'
    );
    console.log('Posts encontrados:', posts);
}

// Scraper para Amazon
async function scrapeAmazon() {
    const productSelectors = {
        title: 'span.a-text-normal',  // Selector actualizado
        price: 'span.a-price-whole',
        rating: 'span.a-icon-alt',
        reviews: 'span.a-size-base.s-underline-text',
        image: { 
            selector: 'img.s-image', 
            attr: 'src' 
        }
    };

    console.log('Iniciando scraping de Amazon...');
    const products = await puppeteerScraper(
        'https://www.amazon.com/-/es/s?k=laptop&language=es',  // URL en español
        productSelectors,
        'div.s-result-item[data-component-type="s-search-result"]'
    );
    console.log('Productos encontrados:', products);
}

// Scraper para MercadoLibre (otro ejemplo popular)
async function scrapeMercadoLibre() {
    const productSelectors = {
        title: '.ui-search-item__title',
        price: '.price-tag-amount',
        location: '.ui-search-item__location',
        link: {
            selector: 'a.ui-search-item__group__element',
            attr: 'href'
        }
    };

    console.log('Iniciando scraping de MercadoLibre...');
    const products = await puppeteerScraper(
        'https://listado.mercadolibre.com.mx/computadoras',
        productSelectors,
        '.ui-search-layout__item'
    );
    console.log('Productos encontrados:', products);
}

// Scraper para Eneba
async function scrapeEneba() {
    const productSelectors = {
        title: '.L7zkU', // Selector para títulos de juegos
        price: '.dWxpw', // Selector para precios
        merchant: '.b5GHN', // Vendedor
        rating: '.lmGJV', // Rating del vendedor si está disponible
        link: {
            selector: 'a.pxcuZ',
            attr: 'href'
        }
    };

    console.log('Iniciando scraping de Eneba...');
    const products = await puppeteerScraper(
        'https://www.eneba.com/latam/store/all?page=1',  // URL de la tienda
        productSelectors,
        '.qfh9K'  // Contenedor de cada producto
    );
    console.log('Productos encontrados en Eneba:', products);
}

// Scraper para Walmart Guatemala
async function scrapeWalmart() {
    const productSelectors = {
        title: '.product-title',
        price: '.product-price',
        description: '.product-description',
        category: '.product-category',
        image: {
            selector: '.product-image img',
            attr: 'src'
        }
    };

    console.log('Iniciando scraping de Walmart Guatemala...');
    const products = await puppeteerScraper(
        'https://www.walmart.com.gt/',
        productSelectors,
        '.product-container'
    );
    console.log('Productos encontrados en Walmart:', products);
}

// Scraper para MAX
async function scrapeMax() {
    const productSelectors = {
        title: '.product-name',
        price: '.price-box .price',
        originalPrice: '.old-price .price',
        discount: '.discount-percentage',
        image: {
            selector: '.product-image-photo',
            attr: 'src'
        }
    };

    console.log('Iniciando scraping de MAX...');
    const products = await puppeteerScraper(
        'https://www.max.com.gt/',
        productSelectors,
        '.product-item'
    );
    console.log('Productos encontrados en MAX:', products);
}

// Scraper para eBay (versión simple que funcionaba)
async function scrapeEbay() {
    const productSelectors = {
        title: 'div.s-item__title > span', // Selector actualizado
        price: 'span.s-item__price',
        condition: 'span.SECONDARY_INFO',
        shipping: 'span.s-item__shipping',
        location: 'span.s-item__location',
        link: {
            selector: 'a.s-item__link',
            attr: 'href'
        }
    };

    console.log('Iniciando scraping de eBay...');
    const products = await puppeteerScraper(
        'https://www.ebay.com/sch/i.html?_nkw=laptop&_ipg=60', // Mostrar 60 items por página
        productSelectors,
        'div.s-item__info',
        false
    );
    
    if (products.length > 0) {
        console.log(`Encontrados ${products.length} productos en eBay`);
        await exportResults(products, 'json', 'ebay_products');
    } else {
        console.log('No se encontraron productos en eBay');
    }
}

// Scraper para MicroQuetzal
async function scrapeMicroQuetzal() {
    const productSelectors = {
        title: '.product-title',
        price: '.price',
        category: '.category',
        description: '.description',
        availability: '.stock',
        image: {
            selector: '.product-image img',
            attr: 'src'
        },
        link: {
            selector: '.product-link',
            attr: 'href'
        }
    };

    console.log('Iniciando scraping de MicroQuetzal...');
    const products = await puppeteerScraper(
        'https://microquetzal.com/',
        productSelectors,
        '.product-item'  // Ajustar según la estructura real del sitio
    );
    console.log('Productos encontrados en MicroQuetzal:', products);
}

// 1. Scraping de múltiples páginas
async function scrapeBooksMultiplePages(selectors, pages = 3) {
    let allBooks = [];
    
    for (let i = 1; i <= pages; i++) {
        console.log(`Scraping página ${i}...`);
        const url = `http://books.toscrape.com/catalogue/page-${i}.html`;
        
        const books = await puppeteerScraper(
            url,
            selectors,
            'article.product_pod'
        );
        
        allBooks = [...allBooks, ...books];
        await delay(2000);
    }
    
    console.log(`Total de libros encontrados: ${allBooks.length}`);
    return allBooks;
}

// 2. Filtrado por categoría
async function scrapeBooksByCategory(selectors, category) {
    const categoryUrls = {
        'science': 'http://books.toscrape.com/catalogue/category/books/science_22/index.html',
        'fiction': 'http://books.toscrape.com/catalogue/category/books/fiction_10/index.html',
        'mystery': 'http://books.toscrape.com/catalogue/category/books/mystery_3/index.html'
        // Puedes añadir más categorías según necesites
    };

    const url = categoryUrls[category.toLowerCase()];
    if (!url) {
        throw new Error('Categoría no encontrada');
    }

    console.log(`Scraping categoría: ${category}`);
    const books = await puppeteerScraper(
        url,
        selectors,
        'article.product_pod'
    );

    return books;
}

// 3. Búsqueda de libros específicos
async function searchBooks(searchTerm, books = null) {
    if (!books) {
        // Si no se proporcionan libros, hacer scraping de la primera página
        books = await scrapeBooksMultiplePages({
            title: 'h3 a',
            price: '.price_color',
            availability: '.availability',
            rating: '.star-rating',
            image: {
                selector: '.image_container img',
                attr: 'src'
            },
            link: {
                selector: 'h3 a',
                attr: 'href'
            }
        }, 1);
    }

    const searchResults = books.filter(book => {
        const title = book.title?.toLowerCase() || '';
        return title.includes(searchTerm.toLowerCase());
    });

    console.log(`Encontrados ${searchResults.length} libros con el término "${searchTerm}"`);
    return searchResults;
}

// 4. Exportación a CSV/JSON
async function exportResults(data, format = 'json', filename = 'books') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        if (format === 'json') {
            const jsonFilename = `${filename}_${timestamp}.json`;
            await fs.writeFile(
                jsonFilename,
                JSON.stringify(data, null, 2),
                'utf8'
            );
            console.log(`Datos exportados a ${jsonFilename}`);
        } 
        else if (format === 'csv') {
            const csvFilename = `${filename}_${timestamp}.csv`;
            
            // Obtener headers del primer objeto
            const headers = Object.keys(data[0]).join(',');
            
            // Convertir datos a formato CSV
            const csvData = data.map(item => 
                Object.values(item)
                    .map(value => `"${value}"`)
                    .join(',')
            );
            
            // Combinar headers y datos
            const csvContent = [headers, ...csvData].join('\n');
            
            await fs.writeFile(csvFilename, csvContent, 'utf8');
            console.log(`Datos exportados a ${csvFilename}`);
        }
    } catch (error) {
        console.error('Error exportando datos:', error);
    }
}

// Función para manejar login de LinkedIn
async function handleLinkedInLogin(page) {
    try {
        // Esperar por el botón de login
        await page.waitForSelector('.nav__button-secondary');
        await page.click('.nav__button-secondary');
        
        // Esperar por el formulario de login
        await page.waitForSelector('#username');
        await page.type('#username', process.env.LINKEDIN_USER || 'tu_email');
        await page.type('#password', process.env.LINKEDIN_PASS || 'tu_password');
        
        await page.click('.login__form_action_container button');
        await page.waitForNavigation();
        
        // Guardar cookies después del login
        const cookies = await page.cookies();
        await fs.writeFile('./linkedin_cookies.json', JSON.stringify(cookies));
    } catch (error) {
        console.error('Error en login de LinkedIn:', error);
    }
}

// Scraper mejorado para LinkedIn
async function scrapeLinkedInJobs() {
    const jobSelectors = {
        title: '.job-card-list__title',
        company: '.job-card-container__company-name',
        location: '.job-card-container__metadata-item',
        description: '.job-card-list__description',
        posted: '.job-card-container__posted-date',
        link: {
            selector: '.job-card-list__title',
            attr: 'href'
        }
    };

    console.log('Iniciando scraping de LinkedIn Jobs...');
    
    // Usar configuración específica para LinkedIn
    const launchOptions = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-notifications',
            '--start-maximized'
        ]
    };

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    try {
        // Cargar cookies si existen
        try {
            const savedCookies = JSON.parse(await fs.readFile('./linkedin_cookies.json'));
            await page.setCookie(...savedCookies);
        } catch (e) {
            console.log('No se encontraron cookies de LinkedIn');
        }

        await page.goto('https://gt.linkedin.com/jobs/desarrollo-de-software-empleos', {
            waitUntil: 'networkidle0'
        });

        // Verificar si necesitamos login
        const needsLogin = await page.$('.nav__button-secondary') !== null;
        if (needsLogin) {
            await handleLinkedInLogin(page);
        }

        // Esperar a que carguen los trabajos
        await page.waitForSelector('.job-card-container', { timeout: 10000 });
        
        // Scroll suave para cargar más trabajos
        await simulateLinkedInBehavior(page);

        // Extraer datos
        const jobs = await page.evaluate((selectors) => {
            const items = [];
            const containers = document.querySelectorAll('.job-card-container');
            
            containers.forEach(container => {
                const item = {};
                for (const [key, selector] of Object.entries(selectors)) {
                    if (typeof selector === 'object') {
                        const element = container.querySelector(selector.selector);
                        item[key] = element ? element.getAttribute(selector.attr) : null;
                    } else {
                        const element = container.querySelector(selector);
                        item[key] = element ? element.textContent.trim() : null;
                    }
                }
                items.push(item);
            });
            
            return items;
        }, jobSelectors);

        console.log(`Encontrados ${jobs.length} empleos en LinkedIn`);
        await exportResults(jobs, 'json', 'linkedin_jobs');
        
    } catch (error) {
        console.error('Error en scraping de LinkedIn:', error);
    } finally {
        await browser.close();
    }
}

// Scraper mejorado para Amazon
async function scrapeAmazonProducts(searchTerm = 'laptop', pages = 1) {
    const productSelectors = {
        title: 'span.a-text-normal',
        price: 'span.a-offscreen',
        rating: 'span.a-icon-alt',
        reviews: 'span.a-size-base.puis-light-weight-text',
        link: {
            selector: 'a.a-link-normal.s-no-outline',
            attr: 'href'
        }
    };

    console.log('Iniciando scraping de Amazon...');
    const products = await puppeteerScraper(
        `https://www.amazon.com/s?k=${searchTerm}&s=review-rank`, // Ordenar por reviews
        productSelectors,
        'div[data-component-type="s-search-result"]',
        false
    );
    
    if (products.length > 0) {
        console.log(`Encontrados ${products.length} productos en Amazon`);
        await exportResults(products, 'json', `amazon_${searchTerm}_products`);
    } else {
        console.log('No se encontraron productos en Amazon');
    }
}

// Función mejorada para simular comportamiento humano en LinkedIn
async function simulateLinkedInBehavior(page) {
    // Scroll suave
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    // Simular hover en algunos trabajos
    const jobCards = await page.$$('.job-card-container');
    for (let card of jobCards.slice(0, 3)) {
        await card.hover();
        await delay(500, 1500);
    }
}

// Modificar la función principal para ejecutar solo eBay y Amazon
async function runScrapers() {
    try {
        console.log('Iniciando scraping...');
        
        // Scraping de eBay
        console.log('\n=== Iniciando scraping de eBay ===');
        await scrapeEbay();
        await delay(5000, 8000);


        // Scraping de Amazon Pausado por ahora
        // console.log('\n=== Iniciando scraping de Amazon ===');
        // await scrapeAmazonProducts('laptop', 1); // Solo 1 página para pruebas
        

        // Comentar LinkedIn por ahora
        // await scrapeLinkedInJobs();
        
    } catch (error) {
        console.error('Error ejecutando scrapers:', error);
    }
}

// Ejecutar los scrapers
runScrapers(); 