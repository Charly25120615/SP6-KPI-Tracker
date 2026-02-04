const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        const res = await axios.get(url);
        
        // Regex para manejar comas y comillas en el CSV
        const rows = res.data.split(/\r?\n/).map(row => {
            return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/"/g, '').trim());
        });

        // SECCIÓN 1: Resumen General (Filas 47-50)
        const bscData = [46, 47, 48, 49].map(i => ({
            categoria: rows[i] ? rows[i][1] : 'N/A',
            nota: rows[i] ? parseFloat(rows[i][3]) || 0 : 0
        }));

        // SECCIÓN 2: KPIs (Filas 2 a 44)
        const kpiData = [];
        for (let i = 1; i <= 43; i++) {
            const row = rows[i];
            if (row && row[5]) {
                kpiData.push({
                    categoria: row[1] || "General",
                    nombre: row[5],
                    meta: row[6],
                    nota: parseFloat(row[22]) || 0
                });
            }
        }

        // SECCIÓN 3: Líderes (Filas 47-56)
        const lideresData = [];
        for (let i = 46; i <= 55; i++) {
            const row = rows[i];
            if (row && row[5] && isNaN(row[5])) {
                lideresData.push({
                    nombre: row[5],
                    nota: parseFloat(row[6]) || 0
                });
            }
        }

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            bscData,
            kpis: kpiData,
            lideres: lideresData
        };

        // Ruta absoluta hacia la carpeta site
        const sitePath = path.join(__dirname, '../site');
        if (!fs.existsSync(sitePath)) fs.mkdirSync(sitePath);
        
        fs.writeFileSync(path.join(sitePath, 'data.json'), JSON.stringify(data, null, 2));
        
        console.log("✅ data.json actualizado correctamente en la carpeta site.");
    } catch (err) {
        console.error("❌ Error en la actualización:", err.message);
    }
}
update();
