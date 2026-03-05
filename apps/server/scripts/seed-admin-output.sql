PRAGMA defer_foreign_keys = ON;
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = 'koris@gmail.com');
DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = 'koris@gmail.com');
DELETE FROM users WHERE email = 'koris@gmail.com';
INSERT INTO users (id, name, email, email_verified, role, banned, created_at, updated_at)
VALUES ('llh4uahmo93dy784ma39iytx', 'koris', 'koris@gmail.com', 1, 'admin', 0, 1772542035, 1772542035);
INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES ('c9tzrl4diqjphvjo9c5is9kk', 'llh4uahmo93dy784ma39iytx', 'credential', 'llh4uahmo93dy784ma39iytx', 'CKpUOk4J960tmwVjPUhHFFGGC6S6ACf1V+7r3yYAY3TxToRotZzhCe9tVO/QzqyC', 1772542035, 1772542035);
PRAGMA defer_foreign_keys = OFF;
