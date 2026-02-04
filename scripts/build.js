const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        const res = await axios.get(url);
        
        // Usamos una expresión regular más avanzada para no romper el CSV si hay comas dentro de las celdas
        const rows = res.data.split(/\r?\n/).map(row => {
            return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/"/g, '').trim());
        });

        // SECCIÓN 1: Resumen (Filas 47-50)
        const bscData = [];
        const bscRows = [46, 47, 48, 49]; 
        bscRows.forEach(i => {
            if (rows[i]) {
                bscData.push({ 
                    categoria: rows[i][1], 
                    nota: parseFloat(rows[i][3]) || 0 
                });
            }
        });

        // SECCIÓN 2: KPIs (Filas 2 a 44)
        const kpiData = [];
        for (let i = 1; i <= 43; i++) {
            const row = rows[i];
            if (row && row[5]) { // Si existe la columna F (Indice 5)
                kpiData.push({
                    categoria: row[1] || "General",
                    nombre: row[5],                // COLUMNA F: Nombre del Indicador
                    meta: row[6],                  // COLUMNA G: Meta Numérica
                    nota: parseFloat(row[22]) || 0, // COLUMNA W: Nota Final
                    trend: row.slice(7, 19).map(v => parseFloat(v) || 0)
                });
            }
        }

        // SECCIÓN 3: Líderes (Filas 47-56)
        const lideresData = [];
        for (let i = 46; i <= 55; i++) {
            const row = rows[i];
            if (row && row[5]) {
                lideresData.push({
                    nombre: row[5], // COLUMNA F: Nombre del Líder
                    nota: parseFloat(row[6]) || 0 // COLUMNA G: Nota del Líder
                });
            }
        }

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            bscData,
            kpis: kpiData,
            lideres: lideresData
        };

        if (!fs.existsSync('site')) fs.mkdirSync('site');
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        
        console.log("✅ data.json sincronizado correctamente con Columnas F, G y W.");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}
update();
