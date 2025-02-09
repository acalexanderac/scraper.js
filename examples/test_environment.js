async function testScraper() {
    const results = {
        withProxy: [],
        withoutProxy: [],
        withStealth: [],
        withoutStealth: []
    };

    // Prueba con diferentes configuraciones
    results.withProxy = await runWithProxy();
    results.withoutProxy = await runWithoutProxy();
    results.withStealth = await runWithStealth();
    results.withoutStealth = await runWithoutStealth();

    // Comparar resultados
    console.table(results);
} 