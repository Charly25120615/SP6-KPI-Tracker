const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        const res = await axios.get(url);
        const rows = res.data.split(/\r?\n/).map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        const meses = rows[0].slice(7, 19); // H a S

        // SECCIÓN 1: Resumen de Perspectivas (Categoría y Nota General)
        const bscData = [];
        for (let i = 46; i <= 49; i++) {
            if (rows[i]) {
                bscData.push({ 
                    categoria: rows[i][1], 
                    nota: parseFloat(rows[i][3]) || 0 
                });
            }
        }

        // SECCIÓN 2: KPIs Unificados (F2:W44)
        // Ahora todas las categorías usan: Nombre(F), Meta(G), Nota(W)
        const kpiData = [];
        for (let i = 1; i <= 43; i++) {
            if (rows[i] && rows[i][5]) { // Si existe la columna F (Nombre del KPI)
                kpiData.push({
                    categoria: rows[i][1] || "General", // Columna B
                    nombre: rows[i][5],                 // Columna F: Título principal de la tarjeta
                    meta: rows[i][6],                   // Columna G: Valor de la Meta
                    nota: parseFloat(rows[i][22]) || 0, // Columna W: Porcentaje de logro
                    trend: rows[i].slice(7, 19).map(v => parseFloat(v) || 0)
                });
            }
        }

        // SECCIÓN 3: Desempeño Gerencial / Líderes (F47:G56)
        const lideresData = [];
        for (let i = 46; i <= 55; i++) {
            if (rows[i] && rows[i][5]) {
                lideresData.push({
                    nombre: rows[i][5], // Columna F: Nombre del Líder
                    nota: parseFloat(rows[i][6]) || 0 // Columna G: Nota del Líder
                });
            }
        }

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            meses, 
            bscData, 
            kpis: kpiData, 
            lideres: lideresData
        };

        if (!fs.existsSync('site')) fs.mkdirSync('site');
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        
        console.log("✅ Datos actualizados con estructura de Procesos para todos los KPIs");
        console.log("📊 Mapeo Global: Título(F), Meta(G), Nota(W)");
        
    } catch (err) {
        console.error("❌ Error en la actualización:", err.message);
        process.exit(1);
    }
}
update();
