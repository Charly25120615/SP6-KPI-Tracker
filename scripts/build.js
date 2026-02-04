const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        const res = await axios.get(url);
        
        // Procesamiento robusto de filas y celdas
        const rows = res.data.split(/\r?\n/).map(row => 
            row.split(',').map(cell => cell.replace(/"/g, '').trim())
        );

        // Meses para el eje X (H1 a S1)
        const meses = rows[0].slice(7, 19);

        // SECCIÓN 1: Resumen (B47:D50) -> Índices 46 a 49
        const bscData = [];
        for (let i = 46; i <= 49; i++) {
            if (rows[i]) {
                bscData.push({
                    categoria: rows[i][1] || "Categoría",
                    nota: parseFloat(rows[i][3]) || 0
                });
            }
        }

        // SECCIÓN 2: KPIs (F2:F44) -> Índices 1 a 43
        const kpiData = [];
        for (let i = 1; i <= 43; i++) {
            if (rows[i] && rows[i][5]) { // F es índice 5
                kpiData.push({
                    categoria: rows[i][1] || "General", // Columna B
                    kpi: rows[i][5],                   // Columna F
                    meta: rows[i][6] || "0%",          // Columna G
                    nota: parseFloat(rows[i][22]) || 0, // Columna W (índice 22)
                    trend: rows[i].slice(7, 19).map(v => parseFloat(v) || 0) // H a S
                });
            }
        }

        // SECCIÓN 3: Líderes (F44:G56) -> Índices 43 a 55
        const lideresData = [];
        for (let i = 43; i <= 55; i++) {
            if (rows[i] && rows[i][5]) {
                lideresData.push({
                    nombre: rows[i][5],                // Columna F
                    nota: parseFloat(rows[i][6]) || 0   // Columna G
                });
            }
        }

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            meses: meses,
            bscData: bscData,
            kpis: kpiData,
            lideres: lideresData
        };

        if (!fs.existsSync('site')) fs.mkdirSync('site');
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ Datos procesados con nuevos rangos.");
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}
update();
