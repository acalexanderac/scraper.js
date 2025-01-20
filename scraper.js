const axios = require('axios');
const cheerio = require('cheerio');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * General purpose scraper that can extract data from any website
 * @param {string} url - The website URL to scrape
 * @param {Object} selectors - Object containing CSS selectors and their corresponding data keys
 * @param {string} containerSelector - The CSS selector for the container that holds each item
 * @returns {Promise<Array>} Array of scraped items
 */
async function generalScraper(url, selectors, containerSelector) {
    try {
        await delay(2000); // Espera 2 segundos antes de cada petición
        // Add a user agent to avoid being blocked
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        };

        // Make HTTP request to the website
        const response = await axios.get(url, { headers });
        
        // Load HTML content into cheerio
        const $ = cheerio.load(response.data);
        
        // Array to store results
        const results = [];
        
        // Select all containers
        $(containerSelector).each((index, container) => {
            const item = {};
            
            // For each selector in our config, extract the data
            for (const [key, selector] of Object.entries(selectors)) {
                if (typeof selector === 'object') {
                    // Handle attributes
                    item[key] = $(container).find(selector.selector).attr(selector.attr);
                } else {
                    // Handle text content
                    item[key] = $(container).find(selector).text().trim();
                }
            }
            
            results.push(item);
        });
        
        return results;
        
    } catch (error) {
        console.error('Error scraping website:', error);
        return [];
    }
}

// Example usage:

// 1. Scraping books (same as before)
async function scrapeBooks() {
    const bookSelectors = {
        title: { selector: 'h3 a', attr: 'title' },
        price: '.price_color'
    };
    
    const books = await generalScraper(
        'https://books.toscrape.com/',
        bookSelectors,
        '.product_pod'
    );
    
    console.log('Books:', books);
}

// 2. Example: Scraping news headlines from Prensa Libre
async function scrapeNews() {
    const newsSelectors = {
        headline: '.story-title, .headline-complete',  // Intentar con diferentes selectores
        summary: '.story-contents p:first-child',
        date: '.story-date'
    };
    
    const news = await generalScraper(
        'https://www.prensalibre.com/',
        newsSelectors,
        '.story-item, article'
    );
    
    console.log('Prensa Libre News:', news);
}

// Reddit scraper
async function scrapeReddit() {
    const redditSelectors = {
        title: 'h3._eYtD2XCVieq6emjKBH3m',  // Post title
        votes: 'div._1rZYMD_4xY3gRcSS3p8ODO', // Upvotes
        author: 'a._2tbHP6ZydRpjI44J3syuqC', // Post author
        subreddit: 'a._3ryJoIoycVkA88fy40qNJc' // Subreddit name
    };
    
    const results = await generalScraper(
        'https://www.reddit.com/',
        redditSelectors,
        'div.Post' // Main post container
    );
    
    console.log('Reddit Posts:', results);
}

// Run the scrapers
async function runScrapers() {
    try {
        console.log('Starting news scraper...');
        await scrapeNews();
        
        console.log('\nStarting Reddit scraper...');
        await scrapeReddit();
    } catch (error) {
        console.error('Error running scrapers:', error);
    }
}

// Run all scrapers
runScrapers();

// Add a new scraping function
async function scrapeCustomWebsite() {
    const selectors = {
        // modify these selectors based on the website you want to scrape
        title: '.your-title-selector',
        description: '.your-description-selector',
        price: '.your-price-selector'
    };
    
    const results = await generalScraper(
        'https://your-website.com',
        selectors,
        '.your-container-selector'
    );
    
    console.log('Results:', results);
}

// Change this line to run your new function
scrapeCustomWebsite();

// Run examples
scrapeBooks();
// scrapeNews();  // Commented out as it needs a real news site URL 