-- Internal template only (instant quote / vehicle hourly). Not shown on public services list.
UPDATE packages SET is_published = 0 WHERE id = 'sys_hourly_iq_template';
