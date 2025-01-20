# 🕷️ Web Scraper Pro

![Web Scraping](https://img.shields.io/badge/Web-Scraping-blue)
![Puppeteer](https://img.shields.io/badge/Puppeteer-v21.5.0-40B5A4)
![Node.js](https://img.shields.io/badge/Node.js-v18.0+-green)

Un potente web scraper construido con Puppeteer que te permite extraer datos de múltiples sitios web populares, con funciones anti-detección y exportación de datos.

## 🚀 Características

- 🔄 Scraping de múltiples sitios web (eBay, Books.toscrape, etc.)
- 📊 Exportación a JSON y CSV con timestamps
- 🛡️ Sistema anti-detección incorporado
- ⏱️ Manejo inteligente de timeouts y reintentos
- 🔄 Sistema de reintentos automáticos
- 📝 Logging detallado de errores y resultados

## 🛠️ Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/acalexanderac/scraper.js.git
cd scraper.js
```

2. Instala las dependencias:

```bash
npm install
```

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
| Books.toscrape | ✅ | Títulos, precios, ratings, disponibilidad |

## 🔧 Funcionalidades Principales

### Exportación de Datos

```javascript
// Exportar a JSON
await exportResults(data, 'json', 'resultados');

// Exportar a CSV
await exportResults(data, 'csv', 'resultados');
```

### Sistema Anti-Detección

- Headers personalizados
- User Agent rotativo
- Manejo de timeouts
- Detección de captchas
- Retraso entre peticiones

## 🛡️ Características de Seguridad

- Manejo de errores robusto
- Sistema de reintentos
- Timeouts configurables
- Interceptación de recursos
- Logging detallado

## 📈 Próximas Mejoras

- [ ] Añadir más sitios web
- [ ] Implementar sistema de proxies
- [ ] Mejorar manejo de captchas
- [ ] Añadir más formatos de exportación
- [ ] Implementar interfaz de usuario

## ⚠️ Aviso Legal

Este scraper es solo para fines educativos y de investigación. Asegúrate de revisar y respetar los términos de servicio de cada sitio web antes de realizar scraping.

## 👨‍💻 Autor

[Alexander Ac](https://github.com/acalexanderac)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---
Hecho con ❤️ y JavaScript
