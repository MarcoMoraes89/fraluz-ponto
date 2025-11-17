// db/index.js
// Interface genérica para o PostgreSQL
const pool = require('./pg_pool');

// ======================================================
// Função genérica para consultas SQL
// ======================================================
async function query(text, params) {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res;
    } catch (err) {
        console.error('Erro na query:', err);
        throw err;
    } finally {
        client.release();
    }
}

// ======================================================
// CRUD genérico
// ======================================================

// Retorna todos os registros de uma tabela
async function findAll(table) {
    const res = await query(`SELECT * FROM ${table} ORDER BY id ASC`);
    return res.rows;
}

// Retorna um registro específico
async function findOne(table, field, value) {
    const res = await query(`SELECT * FROM ${table} WHERE ${field} = $1 LIMIT 1`, [value]);
    return res.rows[0];
}

// Insere um novo registro
async function insert(table, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`;
    const res = await query(sql, values);
    return res.rows[0];
}

// Atualiza um registro pelo ID
async function update(table, id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
    const res = await query(sql, [...values, id]);
    return res.rows[0];
}

// Exclui um registro pelo ID
async function remove(table, id) {
    const sql = `DELETE FROM ${table} WHERE id = $1 RETURNING *;`;
    const res = await query(sql, [id]);
    return res.rows[0];
}

// ======================================================
module.exports = { query, findAll, findOne, insert, update, remove };
