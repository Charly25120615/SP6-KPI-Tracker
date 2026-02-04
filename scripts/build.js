const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAt2WlR-jN3_e0hP-44o5Xl_D6A8YJ5M60L_8h4S8Q3Z-jA5S0/pub?output=csv';
        const res = await axios.get(url);
        
        // Dividimos el contenido en filas, manejando posibles saltos de línea raros
        const rows = res.data.split(/\r?\n/).map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        console.log(`Leídas ${rows.length} filas del Excel.`);

        // SECCIÓN 1: Balance Scorecard (B46:D50 del Excel original)
        // Usamos índices seguros. Si la fila no existe, usamos valores vacíos.
        const bscData = [];
        const indicesBSC = [45, 46, 47, 48]; // Correspondiente a las filas 46-49
        
        indicesBSC.forEach(idx => {
            const row = rows[idx] || [];
            bscData.push({
                categoria: row[1] || "Categoría",
                nota: parseFloat(row[3]) || 0
            });
        });

        // SECCIÓN 2: Tabla de KPIs (Filas 2 a 33 del Excel)
        const items = [];
        for (let i = 1; i <= 32; i++) {
            const row = rows[i] || [];
            if (row.length > 0) {
                items.push({
                    rubro: row[1] || "",
                    empleado: row[2] || "",
                    kpi: row[3] || "",
                    notaW: parseFloat(row[22]) || 0,
                    notaY: parseFloat(row[24]) || 0,
                    trend: row.slice(6, 18).map(v => parseFloat(v) || 0)
                });
            }
        }

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            bscData: bscData,
            items: items
        };

        // Asegurar que la carpeta 'site' existe antes de escribir
        if (!fs.existsSync('site')) {
            fs.mkdirSync('site');
        }
        
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ data.json generado con éxito.");

    } catch (err) {
        console.error("❌ ERROR CRÍTICO:", err.message);
        process.exit(1);
    }
}

update();
