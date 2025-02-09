# 🕷️ Web Scraper Pro

![Web Scraping](https://img.shields.io/badge/Web-Scraping-blue)
![Puppeteer](https://img.shields.io/badge/Puppeteer-v21.5.0-40B5A4)
![Node.js](https://img.shields.io/badge/Node.js-v18.0+-green)

Un potente web scraper construido con Puppeteer que te permite extraer datos de múltiples sitios web populares, con funciones anti-detección y exportación de datos.

## 🚀 Características

- 🔄 Scraping de múltiples sitios web (eBay, Amazon, etc.)
- 📊 Exportación a JSON y CSV con timestamps
- 🛡️ Sistema anti-detección incorporado
- ⏱️ Manejo inteligente de timeouts y reintentos
- 🤖 Simulación de comportamiento humano
- 📝 Logging detallado de errores y resultados

## 🛠️ Instalación

1. **Clonar el repositorio**:
```bash
git clone https://github.com/acalexanderac/scraper.js.git
cd scraper.js
```

2. **Instalar dependencias principales**:
```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

3. **Instalar dependencias adicionales**:
```bash
npm install puppeteer-extra-plugin-recaptcha proxy-chain
```

4. **Crear archivo de configuración** (opcional):
```bash
cp .env.example .env
```

## 📦 Dependencias

- `puppeteer`: ^21.5.0
- `puppeteer-extra`: ^3.3.6
- `puppeteer-extra-plugin-stealth`: ^2.11.2
- `puppeteer-extra-plugin-recaptcha`: ^2.3.3
- `proxy-chain`: ^2.3.0

## 📚 Uso

### Scraping Básico
```javascript
// Ejecutar el scraper
node puppeteer_scraper.js
```

### Sitios Web Implementados

| Sitio Web | Estado | Características |
|-----------|---------|----------------|
| eBay | ✅ | Productos, precios, condición, envío |
| Amazon | 🚧 | Productos, precios, ratings (en desarrollo) |

## 🔧 Configuración

### Variables de Entorno (.env)
```env
# Configuración de Proxies (opcional)
PROXY_SERVER=http://your-proxy-server:port

# Configuración de 2captcha (opcional)
CAPTCHA_API_KEY=your-2captcha-api-key
```

### Configuración de Proxies
Para usar proxies, modifica el archivo `proxy_list.js`:
```javascript
const proxyList = [
    'http://proxy1:port',
    'http://proxy2:port'
];
```

## 🛡️ Características de Seguridad

- Headers personalizados
- User Agent rotativo
- Manejo de timeouts
- Detección de captchas
- Retraso entre peticiones
- Simulación de comportamiento humano
- Evasión de detección de bots

## 📂 Estructura del Proyecto

```
scraper.js/
├── puppeteer_scraper.js    # Scraper principal
├── examples/               # Ejemplos y utilidades
│   ├── stealth_scraper.js
│   ├── proxy_scraper.js
│   └── ...
├── .env                    # Configuración local
└── .gitignore             # Archivos ignorados
```

## 📈 Próximas Mejoras

- [ ] Añadir más sitios web
- [ ] Implementar sistema de proxies rotativo
- [ ] Mejorar manejo de captchas
- [ ] Añadir más formatos de exportación
- [ ] Implementar interfaz de usuario

## ⚠️ Aviso Legal

Este scraper es solo para fines educativos y de investigación. Asegúrate de revisar y respetar los términos de servicio de cada sitio web antes de realizar scraping.

## 🐛 Solución de Problemas

- **Error de Chromium**: Asegúrate de tener Chrome instalado o usa `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- **Error de Proxy**: Verifica que los proxies estén activos y accesibles
- **Bloqueos 403/429**: Aumenta los delays entre peticiones

## 👨‍💻 Autor

[Alexander Ac](https://github.com/acalexanderac)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---
Hecho con ❤️ y JavaScript
