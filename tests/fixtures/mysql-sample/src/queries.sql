SELECT `name`, IFNULL(`email`, 'none') AS email
FROM `users`
WHERE `role` = 'admin'
LIMIT 10, 20;

SELECT `user_id`, GROUP_CONCAT(`title` SEPARATOR ', ') AS titles
FROM `posts`
GROUP BY `user_id`;

INSERT INTO `users` (`name`, `email`)
VALUES ('Alice', 'alice@example.com')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

REPLACE INTO `users` (`id`, `name`, `email`)
VALUES (1, 'Alice', 'alice@updated.com');
