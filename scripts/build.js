const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        const res = await axios.get(url);
        const rows = res.data.split(/\r?\n/).map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        const meses = rows[0].slice(7, 19); // H1:S1

        // SECCIÓN 1: BSC (B47:D50)
        const bscData = [];
        for (let i = 46; i <= 49; i++) {
            if (rows[i]) bscData.push({ categoria: rows[i][1], nota: parseFloat(rows[i][3]) || 0 });
        }

        // SECCIÓN 2: KPIs (F2:W44)
        const kpiData = [];
        for (let i = 1; i <= 43; i++) {
            if (rows[i] && rows[i][5]) {
                kpiData.push({
                    categoria: rows[i][1] || "Otros",
                    nombre: rows[i][5], // Columna F
                    meta: rows[i][6] || "0%", // Columna G
                    nota: parseFloat(rows[i][22]) || 0, // Columna W
                    trend: rows[i].slice(7, 19).map(v => parseFloat(v) || 0)
                });
            }
        }

        // SECCIÓN 3: Líderes (F47:G56)
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
        console.log("✅ Datos sincronizados correctamente");
    } catch (err) {
        process.exit(1);
    }
}
update();
