const fs = require('fs');
const path = require('path');

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';

console.log("🛠️  Generando archivos del sistema...");

// 1. Crear carpetas
const dirs = ['site', 'scripts', '.github/workflows'];
dirs.forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// 2. Crear scripts/build.js
const buildJs = `
const fs = require('fs');
const axios = require('axios');
const { parse } = require('csv-parse/sync');

async function process() {
    try {
        console.log("📥 Descargando datos...");
        const res = await axios.get('${CSV_URL}');
        const rows = parse(res.data, { skip_empty_lines: true });
        
        const kpiMap = new Map();
        rows.slice(1, 44).forEach(row => {
            const kpiName = row[5];
            if (!kpiName) return;
            const trend = row.slice(7, 19).map(v => parseFloat(v) || 0);
            if (!kpiMap.has(kpiName)) {
                kpiMap.set(kpiName, { 
                    rubro: row[1], empleado: row[4], kpi: kpiName, 
                    notaW: parseFloat(row[22]) || 0, 
                    notaY: parseFloat(row[24]) || 0, trend 
                });
            }
        });

        const data = { lastUpdate: new Date().toLocaleString(), items: Array.from(kpiMap.values()) };
        fs.writeFileSync('./site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ data.json generado en /site");
    } catch (e) { console.error("❌ Error:", e.message); }
}
process();`;

fs.writeFileSync('scripts/build.js', buildJs);
fs.writeFileSync('metas.json', '{}');

// 3. Crear site/index.html (Dashboard básico para probar)
fs.writeFileSync('site/index.html', '<h1>Dashboard Listo</h1><p>Mira la consola para ver los datos.</p>');

console.log("✅ Carpetas y archivos creados con éxito.");