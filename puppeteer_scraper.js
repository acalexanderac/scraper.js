const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// Función de delay para esperar entre acciones
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Scraper general usando Puppeteer
 * @param {string} url - URL del sitio web
 * @param {Object} selectors - Selectores CSS para extraer datos
 * @param {string} containerSelector - Selector del contenedor principal
 */
async function puppeteerScraper(url, selectors, containerSelector) {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            defaultViewport: { width: 1920, height: 1080 },
            // Añadir argumentos para evitar detección
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"'
            ]
        });

        const page = await browser.newPage();

        // Configurar timeouts más largos
        await page.setDefaultNavigationTimeout(60000); // 60 segundos
        await page.setDefaultTimeout(60000);

        // Configurar headers más completos
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'DNT': '1'
        });

        // Interceptar peticiones para evitar recursos innecesarios
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Navegar a la página con retry
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
                await delay(5000); // Esperar 5 segundos antes de reintentar
            }
        }

        // Esperar más tiempo para contenido dinámico
        await delay(5000);

        // Verificar si hay captcha o bloqueo
        const pageContent = await page.content();
        if (pageContent.includes('captcha') || pageContent.includes('robot') || pageContent.includes('blocked')) {
            console.log('Detectado captcha o bloqueo. Intentando bypass...');
            // Aquí podrías implementar lógica adicional para manejar captchas
        }

        // Extraer datos
        const results = await page.evaluate((containerSelector, selectors) => {
            const items = [];
            const containers = document.querySelectorAll(containerSelector);

            containers.forEach(container => {
                const item = {};
                
                // Extraer datos usando los selectores
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

        // Cerrar el navegador
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
        title: 'h3.s-item__title',
        price: 'span.s-item__price',
        condition: 'span.SECONDARY_INFO',
        shipping: 'span.s-item__shipping.s-item__logisticsCost',
        link: {
            selector: 'a.s-item__link',
            attr: 'href'
        }
    };

    console.log('Iniciando scraping de eBay...');
    const products = await puppeteerScraper(
        'https://www.ebay.com/sch/i.html?_nkw=laptop',
        productSelectors,
        '.s-item__wrapper'
    );
    console.log('Productos encontrados en eBay:', products);
    
    // Exportar resultados a JSON
    await exportResults(products, 'json', 'ebay_products');
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

// Función principal simplificada
async function runScrapers() {
    try {
        console.log('Iniciando scraping...');
        await scrapeEbay();
    } catch (error) {
        console.error('Error ejecutando scrapers:', error);
    }
}

// Ejecutar los scrapers
runScrapers(); 