const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAt2WlR-jN3_e0hP-44o5Xl_D6A8YJ5M60L_8h4S8Q3Z-jA5S0/pub?output=csv';
        const res = await axios.get(url);
        
        // Limpieza básica de datos del CSV
        const rows = res.data.split('\n').map(row => 
            row.split(',').map(cell => cell.replace(/"/g, '').trim())
        );

        // Extraer Sección 1 (B46:D50) -> Filas índice 45 a 49
        const bscData = [];
        for (let i = 45; i <= 48; i++) {
            if (rows[i]) {
                bscData.push({
                    categoria: rows[i][1] || "Categoría",
                    nota: parseFloat(rows[i][3]) || 0
                });
            }
        }

        // Extraer Tabla de KPIs (Índices 1 a 32)
        const items = [];
        for (let i = 1; i <= 32; i++) {
            if (rows[i]) {
                items.push({
                    rubro: rows[i][1] || "",
                    empleado: rows[i][2] || "",
                    kpi: rows[i][3] || "",
                    notaW: parseFloat(rows[i][22]) || 0,
                    notaY: parseFloat(rows[i][24]) || 0,
                    trend: rows[i].slice(6, 18).map(v => parseFloat(v) || 0)
                });
            }
        }

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            bscData: bscData,
            items: items
        };

        if (!fs.existsSync('site')) fs.mkdirSync('site');
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ Proceso completado");
    } catch (err) {
        console.error("❌ Error detectado:", err.message);
        process.exit(1);
    }
}
update();
