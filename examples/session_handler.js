async function handleSession() {
    // Guardar cookies
    const cookies = await page.cookies();
    await fs.writeFile('./cookies.json', JSON.stringify(cookies));

    // Cargar cookies
    const savedCookies = JSON.parse(await fs.readFile('./cookies.json'));
    await page.setCookie(...savedCookies);
} 