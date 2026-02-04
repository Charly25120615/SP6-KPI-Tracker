const axios = require('axios');
const { parse } = require('csv-parse/sync');
const fs = require('fs');

async function update() {
    try {
        // Tu URL de Google Sheets en formato CSV
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAt2WlR-jN3_e0hP-44o5Xl_D6A8YJ5M60L_8h4S8Q3Z-jA5S0/pub?output=csv';
        const res = await axios.get(url);
        const rows = parse(res.data, { skip_empty_lines: true });

        // --- EXTRACCIÓN DE LA SECCIÓN 1 (B46:D50) ---
        // Ajustamos los índices para las filas 46 a 50 del Excel
        const bscData = rows.slice(45, 49).map(row => ({
            categoria: row[1], // Columna B
            nota: parseFloat(row[3]) || 0 // Columna D (Nota del mes actual)
        }));

        // --- EXTRACCIÓN DE LOS KPIs (Tabla principal) ---
        const items = rows.slice(1, 33).map(row => ({
            rubro: row[1],
            empleado: row[2],
            kpi: row[3],
            notaW: parseFloat(row[22]) || 0,
            notaY: parseFloat(row[24]) || 0,
            trend: row.slice(6, 18).map(v => parseFloat(v) || 0)
        }));

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            bscData: bscData, // <--- ESTO ES LO QUE FALTA EN TU JSON
            items: items
        };

        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ data.json actualizado con éxito");
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

update();
