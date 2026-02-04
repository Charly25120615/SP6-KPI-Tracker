const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAt2WlR-jN3_e0hP-44o5Xl_D6A8YJ5M60L_8h4S8Q3Z-jA5S0/pub?output=csv';
        const res = await axios.get(url);
        
        // Dividimos el CSV por líneas y luego por comas de forma simple
        const rows = res.data.split('\n').map(row => row.split(','));

        // Extraer Sección 1 (Filas 46 a 50 del Excel)
        // Usamos índices 45 a 49
        const bscData = rows.slice(45, 49).map(row => ({
            categoria: row[1] ? row[1].replace(/"/g, '') : "Sin Categoría",
            nota: parseFloat(row[3]) || 0
        }));

        // Extraer Tabla de KPIs
        const items = rows.slice(1, 33).map(row => ({
            rubro: row[1] ? row[1].replace(/"/g, '') : "",
            empleado: row[2] ? row[2].replace(/"/g, '') : "",
            kpi: row[3] ? row[3].replace(/"/g, '') : "",
            notaW: parseFloat(row[22]) || 0,
            notaY: parseFloat(row[24]) || 0,
            trend: row.slice(6, 18).map(v => parseFloat(v) || 0)
        }));

        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            bscData: bscData,
            items: items
        };

        // Verificamos que la carpeta site existe, si no, la crea
        if (!fs.existsSync('site')) fs.mkdirSync('site');
        
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ data.json generado con éxito");
    } catch (err) {
        console.error("❌ Error en el script:", err.message);
        process.exit(1);
    }
}

update();
