const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        const res = await axios.get(url);
        const rows = res.data.split(/\r?\n/).map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        // SECCIÓN 1: Resumen de Perspectivas (Filas 47-50 en Excel)
        const bscData = [];
        for (let i = 46; i <= 49; i++) {
            if (rows[i]) bscData.push({ categoria: rows[i][1], nota: parseFloat(rows[i][3]) || 0 });
        }

        // SECCIÓN 2: KPIs Unificados (Filas 2-44)
        // Mapeo Estricto: Título(F/Col5), Meta(G/Col6), Nota(W/Col22)
        const kpiData = [];
        for (let i = 1; i <= 43; i++) {
            if (rows[i] && rows[i][5]) { 
                kpiData.push({
                    categoria: rows[i][1] || "General",
                    nombre: rows[i][5],                // Columna F: Nombre del Indicador
                    meta: rows[i][6],                  // Columna G: Meta (90%, >=1, etc)
                    nota: parseFloat(rows[i][22]) || 0, // Columna W: Porcentaje
                    trend: rows[i].slice(7, 19).map(v => parseFloat(v) || 0)
                });
            }
        }

        // SECCIÓN 3: Desempeño Gerencial (Filas 47-56)
        const lideresData = [];
        for (let i = 46; i <= 55; i++) {
            if (rows[i] && rows[i][5]) {
                lideresData.push({
                    nombre: rows[i][5], // Columna F: Nombre del Líder
                    nota: parseFloat(rows[i][6]) || 0 // Columna G: Nota
                });
            }
        }

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            bscData, kpis: kpiData, lideres: lideresData
        };

        // Crear carpeta 'site' si no existe y guardar el JSON
        if (!fs.existsSync('site')) fs.mkdirSync('site');
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        
        console.log("✅ data.json generado con éxito en /site");
    } catch (err) {
        console.error("❌ Error en build.js:", err.message);
    }
}
update();
