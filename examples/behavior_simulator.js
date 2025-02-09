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

    // Delays aleatorios
    await delay(2000 + Math.random() * 3000);
} 