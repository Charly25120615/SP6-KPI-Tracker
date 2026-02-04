const fs = require('fs');
const axios = require('axios');
const { parse } = require('csv-parse/sync');

async function process() {
    try {
        console.log("📥 Descargando datos desde Google Sheets...");
        const res = await axios.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv');
        
        // Obtenemos todas las filas, incluyendo las vacías para mantener los índices de las celdas exactos
        const rows = parse(res.data, { skip_empty_lines: false });
        
        // --- SECCIÓN 1: EXTRACCIÓN DE TABLA B46:D50 ---
        // En un CSV, la fila 46 es el índice 45 (empezando desde 0)
        const bscData = rows.slice(45, 50).map(row => ({
            categoria: row[1],             // Columna B (Índice 1)
            nota: parseFloat(row[3]) || 0  // Columna D (Índice 3)
        }));

        // --- SECCIÓN 2 & 3: EXTRACCIÓN DE KPIs (Filas 2 a 44) ---
        const kpiMap = new Map();
        rows.slice(1, 44).forEach(row => {
            const kpiName = row[5]; // Columna F
            if (!kpiName) return;
            
            const trend = row.slice(7, 19).map(v => parseFloat(v) || 0);
            if (!kpiMap.has(kpiName)) {
                kpiMap.set(kpiName, { 
                    rubro: row[1], 
                    empleado: row[4], 
                    kpi: kpiName, 
                    notaW: parseFloat(row[22]) || 0, 
                    notaY: parseFloat(row[24]) || 0, 
                    trend 
                });
            }
        });

        // --- GENERACIÓN DEL ARCHIVO FINAL ---
        const data = { 
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }), 
            bscData: bscData, // <--- Nueva tabla para la Sección 1
            items: Array.from(kpiMap.values()) 
        };

        fs.writeFileSync('./site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ data.json generado con éxito en /site");
        
    } catch (e) { 
        console.error("❌ Error en el proceso de build:", e.message); 
    }
}

process();
