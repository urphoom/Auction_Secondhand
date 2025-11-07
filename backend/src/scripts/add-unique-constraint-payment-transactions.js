import { getPool } from '../utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function addUniqueConstraint() {
  console.log('🔍 Checking for duplicate payment transactions...\n');
  
  const pool = await getPool();
  
  try {
    // 1. Check for duplicate transactions
    console.log('1. Checking for duplicate transactions...');
    const [duplicates] = await pool.query(`
      SELECT auction_id, COUNT(*) as count
      FROM payment_transactions
      GROUP BY auction_id
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate transactions found!\n');
    } else {
      console.log(`⚠️  Found ${duplicates.length} auctions with duplicate transactions:\n`);
      
      for (const dup of duplicates) {
        console.log(`   - Auction ID ${dup.auction_id}: ${dup.count} transactions`);
        
        // Get all transactions for this auction
        const [transactions] = await pool.query(`
          SELECT id, auction_id, winner_id, seller_id, amount, status, created_at
          FROM payment_transactions
          WHERE auction_id = ?
          ORDER BY created_at ASC
        `, [dup.auction_id]);
        
        console.log(`     Transactions:`, transactions.map(t => ({
          id: t.id,
          status: t.status,
          created_at: t.created_at
        })));
        
        // Keep the first transaction, delete the rest
        const transactionsToDelete = transactions.slice(1);
        console.log(`     Keeping transaction ID ${transactions[0].id}, deleting ${transactionsToDelete.length} duplicate(s)...`);
        
        for (const transaction of transactionsToDelete) {
          // Delete related escrow records first
          await pool.query(`
            DELETE FROM payment_escrow 
            WHERE transaction_id = ?
          `, [transaction.id]);
          
          // Delete related shipping info
          await pool.query(`
            DELETE FROM shipping_info 
            WHERE transaction_id = ?
          `, [transaction.id]);
          
          // Delete the transaction
          await pool.query(`
            DELETE FROM payment_transactions 
            WHERE id = ?
          `, [transaction.id]);
          
          console.log(`     ✅ Deleted transaction ID ${transaction.id}`);
        }
      }
      
      console.log('\n✅ All duplicate transactions have been removed!\n');
    }
    
    // 2. Check if unique constraint already exists
    console.log('2. Checking if unique constraint exists...');
    const [indexes] = await pool.query(`
      SHOW INDEX FROM payment_transactions 
      WHERE Key_name = 'unique_auction'
    `);
    
    if (indexes.length > 0) {
      console.log('✅ Unique constraint already exists!\n');
      return;
    }
    
    // 3. Add unique constraint
    console.log('3. Adding unique constraint on auction_id...');
    await pool.query(`
      ALTER TABLE payment_transactions 
      ADD UNIQUE KEY unique_auction (auction_id)
    `);
    
    console.log('✅ Unique constraint added successfully!\n');
    console.log('🎉 Migration completed! Now each auction can only have one payment transaction.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('\n⚠️  Cannot add unique constraint: Duplicate entries still exist.');
      console.error('Please run this script again to clean up duplicates first.');
    } else if (error.code === 'ER_DUP_KEYNAME') {
      console.log('✅ Unique constraint already exists!');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Run the migration
addUniqueConstraint()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });


