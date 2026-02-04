const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        // URL actualizada con el enlace que me pasaste
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        
        console.log("Conectando con Google Sheets...");
        const res = await axios.get(url);
        
        // Procesamiento de filas
        const rows = res.data.split(/\r?\n/).map(row => 
            row.split(',').map(cell => cell.replace(/"/g, '').trim())
        );

        console.log(`Datos recibidos: ${rows.length} filas encontradas.`);

        // SECCIÓN 1: Balance Scorecard (Filas 46 a 49 del Excel)
        const bscData = [];
        const indicesBSC = [45, 46, 47, 48]; 
        indicesBSC.forEach(idx => {
            if (rows[idx]) {
                bscData.push({
                    categoria: rows[idx][1] || "Categoría",
                    nota: parseFloat(rows[idx][3]) || 0
                });
            }
        });

        // SECCIÓN 2: Detalle de KPIs (Filas 2 a 33 del Excel)
        const items = [];
        for (let i = 1; i <= 32; i++) {
            if (rows[i] && rows[i].length > 5) {
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

        // Verificamos que la carpeta 'site' exista para guardar data.json
        if (!fs.existsSync('site')) {
            fs.mkdirSync('site');
        }
        
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ ¡Archivo site/data.json actualizado con éxito!");

    } catch (err) {
        console.error("❌ ERROR CRÍTICO:", err.message);
        process.exit(1);
    }
}

update();
