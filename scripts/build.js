
const fs = require('fs');
const axios = require('axios');
const { parse } = require('csv-parse/sync');

async function process() {
    try {
        console.log("📥 Descargando datos...");
        const res = await axios.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv');
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
process();