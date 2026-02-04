const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        const res = await axios.get(url);
        
        // Regex avanzado para manejar comas dentro de comillas en el CSV
        const rows = res.data.split(/\r?\n/).map(row => {
            return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/"/g, '').trim());
        });

        // SECCIÓN 1: Resumen General (Filas 47-50 del Excel -> Índices 46-49)
        const bscData = [];
        const bscRows = [46, 47, 48, 49]; 
        bscRows.forEach(i => {
            if (rows[i]) {
                bscData.push({ 
                    categoria: rows[i][1], // Columna B
                    nota: parseFloat(rows[i][3]) || 0 // Columna D
                });
            }
        });

        // SECCIÓN 2: KPIs (Filas 2 a 44 del Excel -> Índices 1 a 43)
        const kpiData = [];
        for (let i = 1; i <= 43; i++) {
            const row = rows[i];
            if (row && row[5]) { // Si existe contenido en Columna F
                kpiData.push({
                    categoria: row[1] || "General",      // COLUMNA B
                    nombre: row[5],                     // COLUMNA F: Nombre del Indicador
                    meta: row[6],                       // COLUMNA G: Meta Numérica o Condicional
                    nota: parseFloat(row[22]) || 0,      // COLUMNA W: Nota Final (Índice 22)
                    // Trend de columnas H a S (Índices 7 a 18)
                    trend: row.slice(7, 19).map(v => parseFloat(v) || 0)
                });
            }
        }

        // SECCIÓN 3: Líderes (Filas 47-56 del Excel -> Índices 46-55)
        // Nota: Ajustamos para que tome el nombre del líder de la Columna F y su nota de la G en esa sección
        const lideresData = [];
        for (let i = 46; i <= 55; i++) {
            const row = rows[i];
            if (row && row[5] && isNaN(row[5])) { // Evitamos filas de resumen si el nombre es un número
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
        
        console.log("✅ data.json actualizado: Títulos (Col F), Metas (Col G), Notas (Col W).");
    } catch (err) {
        console.error("❌ Error en la actualización:", err.message);
    }
}
update();
