const db = require('./db/pg');

(async () => {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('Conexão OK! Horário do servidor:', res.rows[0].now);
  } catch (err) {
    console.error('Erro de conexão:', err);
  } finally {
    await db.end();
  }
})();
