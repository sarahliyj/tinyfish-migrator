CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user', 'moderator') DEFAULT 'user',
  `age` TINYINT UNSIGNED,
  `score` MEDIUMINT,
  `balance` DOUBLE,
  `created_at` DATETIME DEFAULT NOW()
);

CREATE TABLE `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255),
  `tags` TEXT
);
