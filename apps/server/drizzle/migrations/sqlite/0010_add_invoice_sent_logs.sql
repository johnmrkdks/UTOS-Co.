-- Invoice sent logs table for tracking all invoices emailed
CREATE TABLE IF NOT EXISTS invoice_sent_logs (
	id TEXT PRIMARY KEY NOT NULL,
	type TEXT NOT NULL CHECK (type IN ('driver', 'company')),
	recipient_name TEXT NOT NULL,
	recipient_email TEXT NOT NULL,
	period_start INTEGER NOT NULL,
	period_end INTEGER NOT NULL,
	sent_by_user_id TEXT NOT NULL,
	created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
