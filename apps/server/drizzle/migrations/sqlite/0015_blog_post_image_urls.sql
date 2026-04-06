ALTER TABLE `blog_posts` ADD `image_urls` text;
UPDATE `blog_posts` SET `image_urls` = json_array(`image_url`) WHERE `image_urls` IS NULL;
