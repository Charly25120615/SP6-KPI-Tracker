const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        const res = await axios.get(url);
        const rows = res.data.split(/\r?\n/).map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        const meses = rows[0].slice(7, 19); // H a S

        // SECCIÓN 1: BSC
        const bscData = [];
        for (let i = 46; i <= 49; i++) {
            if (rows[i]) bscData.push({ categoria: rows[i][1], nota: parseFloat(rows[i][3]) || 0 });
        }

        // SECCIÓN 2: KPIs (F2:W44) - Mapeo exacto de columnas
        const kpiData = [];
        for (let i = 1; i <= 43; i++) {
            if (rows[i] && rows[i][5]) { // Si existe la columna F
                kpiData.push({
                    categoria: rows[i][1] || "General",
                    nombre: rows[i][5],   // Columna F: Nombre del KPI
                    meta: rows[i][6],     // Columna G: Meta
                    nota: parseFloat(rows[i][22]) || 0, // Columna W: Nota
                    trend: rows[i].slice(7, 19).map(v => parseFloat(v) || 0)
                });
            }
        }

        // SECCIÓN 3: Gerencia (F47:G56)
        const lideresData = [];
        for (let i = 46; i <= 55; i++) {
            if (rows[i] && rows[i][5]) {
                lideresData.push({
                    nombre: rows[i][5],
                    nota: parseFloat(rows[i][6]) || 0
                });
            }
        }

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            meses, bscData, kpis: kpiData, lideres: lideresData
        };

        if (!fs.existsSync('site')) fs.mkdirSync('site');
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ Datos mapeados: KPI(F), Meta(G), Nota(W)");
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}
update();
