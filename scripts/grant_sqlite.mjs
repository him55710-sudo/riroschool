import sqlite3 from 'sqlite3';
import path from 'path';

// dev.db is at <workspace-root>/packages/shared/prisma/dev.db usually, or in the root. 
// Let's resolve the path relative to process.cwd()
const dbPath = path.resolve(process.cwd(), 'packages/shared/prisma/dev.db');
const db = new sqlite3.Database(dbPath);

const email = 'him55710@gmail.com';
const amount = 100000;

db.serialize(() => {
    // 1. Get user ID first
    db.get('SELECT id, credits FROM User WHERE email = ?', [email], (err, user) => {
        if (err || !user) {
            console.error('Failed to find user him55710@gmail.com or an error occurred.', err);
            db.close();
            return;
        }

        console.log(`Found user ID: ${user.id} with ${user.credits} credits.`);

        // 2. Update the user credits
        db.run('UPDATE User SET credits = credits + ? WHERE email = ?', [amount, email], (updateErr) => {
            if (updateErr) {
                console.error('Failed to update credits', updateErr);
                db.close();
                return;
            }

            // 3. Insert the ledger record
            const ledgerId = 'cl_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            db.run(
                'INSERT INTO CreditLedger (id, userId, delta, reason, ts) VALUES (?, ?, ?, ?, datetime("now"))',
                [ledgerId, user.id, amount, 'ADMIN_GRANT'],
                (insertErr) => {
                    if (insertErr) {
                        console.error('Failed to add ledger record (but credits changed)', insertErr);
                    } else {
                        console.log(`Successfully added 100,000 credits to ${email}! Restart the web page to see the changes.`);
                    }
                    db.close();
                }
            );
        });
    });
});
