async function monitorBlocks(page) {
    page.on('response', async response => {
        const status = response.status();
        if (status === 403 || status === 429) {
            console.log(`Bloqueo detectado: ${status}`);
            // Implementar lógica de recuperación
        }
    });
} 