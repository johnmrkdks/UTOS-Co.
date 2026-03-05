DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@gmail.com');
DELETE FROM users WHERE email = 'admin@gmail.com';