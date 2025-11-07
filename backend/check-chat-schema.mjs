import { getPool } from './src/utils/db.js';

const pool = await getPool();
try {
  const [columns] = await pool.query('SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = \'chat_rooms\'');
  console.log('chat_rooms columns:', columns);
  const [foreignKeys] = await pool.query('SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = \'chat_rooms\' AND CONSTRAINT_TYPE = \'FOREIGN KEY\'');
  console.log('chat_rooms foreign keys:', foreignKeys);
} catch (err) {
  console.error('Error inspecting schema:', err);
} finally {
  process.exit(0);
}
