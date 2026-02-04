const axios = require('axios');
const fs = require('fs');

async function update() {
    try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPotKOx5NYnEXNJKl-9oof0awv1vlzzIw_imGVWQRRnLvArsydB4bfb8PiKZsxCg/pub?output=csv';
        const res = await axios.get(url);
        // Separamos por filas y luego por comas, limpiando espacios y comillas
        const rows = res.data.split(/\r?\n/).map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        // Los meses están en la fila 1 (índice 0), columnas H a S (índices 7 al 18)
        const meses = rows[0].slice(7, 19); 

        // SECCIÓN 2: KPIs (Rango F2:W44)
        // Empezamos en la fila índice 1 (F2) hasta la 43 (F44)
        const kpiData = [];
        for (let i = 1; i <= 43; i++) {
            if (rows[i] && rows[i][5]) { // Si existe la columna F
                kpiData.push({
                    nombre: rows[i][5],      // COLUMNA F: Nombre del KPI
                    trend: rows[i].slice(7, 19).map(v => parseFloat(v) || 0) // COLUMNAS H a S: Trend
                });
            }
        }

        // Guardamos solo lo necesario para el gráfico por ahora
        const data = {
            lastUpdate: new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
            meses,
            kpis: kpiData
        };

        if (!fs.existsSync('site')) fs.mkdirSync('site');
        fs.writeFileSync('site/data.json', JSON.stringify(data, null, 2));
        console.log("✅ Gráfico configurado con Columna F y Trend H:S");
    } catch (err) {
        console.error("❌ Error detectado:", err.message);
        process.exit(1);
    }
}
update();
