-- =========================================================
-- Kin Conecta - Esquema MySQL 8 (sin pasarela de pagos)
-- =========================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS `kin_conecta`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `kin_conecta`;

-- ---------------------------------------------------------
-- Limpieza para ejecuciones repetidas
-- ---------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `newsletter_subscriptions`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `compatibility_answers`;
DROP TABLE IF EXISTS `compatibility_profiles`;
DROP TABLE IF EXISTS `withdrawal_requests`;
DROP TABLE IF EXISTS `income_transactions`;
DROP TABLE IF EXISTS `faq_items`;
DROP TABLE IF EXISTS `faq_categories`;
DROP TABLE IF EXISTS `support_ticket_attachments`;
DROP TABLE IF EXISTS `support_tickets`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chat_threads`;
DROP TABLE IF EXISTS `review_replies`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `favorite_tours`;
DROP TABLE IF EXISTS `favorite_guides`;
DROP TABLE IF EXISTS `guide_calendar_events`;
DROP TABLE IF EXISTS `trip_status_history`;
DROP TABLE IF EXISTS `trip_bookings`;
DROP TABLE IF EXISTS `tour_destinations`;
DROP TABLE IF EXISTS `tour_included_items`;
DROP TABLE IF EXISTS `tours`;
DROP TABLE IF EXISTS `destinations`;
DROP TABLE IF EXISTS `tour_categories`;
DROP TABLE IF EXISTS `guide_adaptations`;
DROP TABLE IF EXISTS `guide_certifications`;
DROP TABLE IF EXISTS `guide_locations`;
DROP TABLE IF EXISTS `guide_profile_expertise`;
DROP TABLE IF EXISTS `guide_expertise_areas`;
DROP TABLE IF EXISTS `tourist_profile_interests`;
DROP TABLE IF EXISTS `interests`;
DROP TABLE IF EXISTS `guide_profile_languages`;
DROP TABLE IF EXISTS `tourist_profile_languages`;
DROP TABLE IF EXISTS `guide_profiles`;
DROP TABLE IF EXISTS `tourist_profiles`;
DROP TABLE IF EXISTS `auth_sessions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `languages`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------
-- Catálogos base
-- ---------------------------------------------------------
CREATE TABLE `languages` (
  `language_code` CHAR(8) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`language_code`),
  UNIQUE KEY `uq_languages_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `languages` (`language_code`, `name`) VALUES
('es', 'Español'),
('en', 'English'),
('fr', 'Français'),
('pt', 'Português'),
('de', 'Deutsch'),
('it', 'Italiano')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ---------------------------------------------------------
-- Usuarios y autenticación
-- ---------------------------------------------------------
CREATE TABLE `users` (
  `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role` ENUM('tourist','guide','admin') NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `date_of_birth` DATE NULL,
  `email` VARCHAR(190) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `country_code` VARCHAR(8) NULL,
  `phone_number` VARCHAR(20) NULL,
  `phone_e164` VARCHAR(24) NULL,
  `preferred_language_code` CHAR(8) NULL,
  `account_status` ENUM('pending','active','suspended','deleted') NOT NULL DEFAULT 'active',
  `email_verified_at` DATETIME NULL,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_phone_e164` (`phone_e164`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`account_status`),
  KEY `idx_users_created_at` (`created_at`),
  CONSTRAINT `fk_users_language`
    FOREIGN KEY (`preferred_language_code`)
    REFERENCES `languages` (`language_code`)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auth_sessions` (
  `session_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked_at` DATETIME NULL,
  `ip` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `uq_auth_sessions_token_hash` (`token_hash`),
  KEY `idx_auth_sessions_user` (`user_id`),
  KEY `idx_auth_sessions_expires_at` (`expires_at`),
  CONSTRAINT `fk_auth_sessions_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Perfiles (turista / guía)
-- ---------------------------------------------------------
CREATE TABLE `tourist_profiles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `location` VARCHAR(150) NULL,
  `bio` TEXT NULL,
  `member_since` DATE NULL,
  `badge` VARCHAR(100) NULL,
  `travel_style` VARCHAR(200) NULL,
  `trip_type` VARCHAR(200) NULL,
  `pace_and_company` VARCHAR(255) NULL,
  `activity_level` ENUM('Bajo','Moderado','Alto') NULL,
  `group_preference` VARCHAR(200) NULL,
  `dietary_preferences` VARCHAR(255) NULL,
  `planning_level` ENUM('Bajo','Intermedio','Alto') NULL,
  `amenities` VARCHAR(255) NULL,
  `transport` VARCHAR(255) NULL,
  `photo_preference` VARCHAR(255) NULL,
  `accessibility` VARCHAR(255) NULL,
  `additional_notes` TEXT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `cover_url` VARCHAR(500) NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_tourist_profiles_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guide_profiles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `summary` TEXT NULL,
  `story` TEXT NULL,
  `status_text` VARCHAR(80) NULL,
  `hourly_rate` DECIMAL(10,2) NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'MXN',
  `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `reviews_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `location_label` VARCHAR(150) NULL,
  `experience_level` VARCHAR(120) NULL,
  `style` TEXT NULL,
  `group_size` VARCHAR(120) NULL,
  `tour_intensity` VARCHAR(120) NULL,
  `transport_offered` VARCHAR(255) NULL,
  `photo_style` VARCHAR(255) NULL,
  `additional_notes` TEXT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `cover_url` VARCHAR(500) NULL,
  `post_text` TEXT NULL,
  `post_image_url` VARCHAR(500) NULL,
  `post_caption` VARCHAR(255) NULL,
  `post_published_at` DATETIME NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  KEY `idx_guide_profiles_rating` (`rating_avg`),
  CONSTRAINT `fk_guide_profiles_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `chk_guide_profiles_rating`
    CHECK (`rating_avg` >= 0 AND `rating_avg` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tourist_profile_languages` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `language_code` CHAR(8) NOT NULL,
  PRIMARY KEY (`user_id`, `language_code`),
  KEY `idx_tpl_language` (`language_code`),
  CONSTRAINT `fk_tpl_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `tourist_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tpl_language`
    FOREIGN KEY (`language_code`)
    REFERENCES `languages` (`language_code`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guide_profile_languages` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `language_code` CHAR(8) NOT NULL,
  PRIMARY KEY (`user_id`, `language_code`),
  KEY `idx_gpl_language` (`language_code`),
  CONSTRAINT `fk_gpl_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_gpl_language`
    FOREIGN KEY (`language_code`)
    REFERENCES `languages` (`language_code`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `interests` (
  `interest_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`interest_id`),
  UNIQUE KEY `uq_interests_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `interests` (`name`) VALUES
('Cultura'), ('Gastronomía'), ('Aventura'), ('Naturaleza'), ('Historia'),
('Arte'), ('Fotografía'), ('Vida nocturna'), ('Compras'), ('Bienestar/Relax')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

CREATE TABLE `tourist_profile_interests` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `interest_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `interest_id`),
  KEY `idx_tpi_interest` (`interest_id`),
  CONSTRAINT `fk_tpi_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `tourist_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tpi_interest`
    FOREIGN KEY (`interest_id`)
    REFERENCES `interests` (`interest_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guide_expertise_areas` (
  `expertise_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`expertise_id`),
  UNIQUE KEY `uq_guide_expertise_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `guide_expertise_areas` (`name`) VALUES
('Historia'), ('Tours gastronómicos'), ('Aventura'), ('Fotografía'),
('Arte y cultura'), ('Naturaleza'), ('Vida nocturna'),
('Experiencias premium'), ('Tours familiares')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

CREATE TABLE `guide_profile_expertise` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `expertise_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `expertise_id`),
  KEY `idx_gpe_expertise` (`expertise_id`),
  CONSTRAINT `fk_gpe_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_gpe_expertise`
    FOREIGN KEY (`expertise_id`)
    REFERENCES `guide_expertise_areas` (`expertise_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guide_locations` (
  `guide_location_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `location_name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`guide_location_id`),
  UNIQUE KEY `uq_guide_location_unique` (`user_id`, `location_name`),
  KEY `idx_guide_location_name` (`location_name`),
  CONSTRAINT `fk_guide_locations_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guide_certifications` (
  `certification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`certification_id`),
  UNIQUE KEY `uq_guide_cert_unique` (`user_id`, `name`),
  CONSTRAINT `fk_guide_certifications_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guide_adaptations` (
  `adaptation_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`adaptation_id`),
  UNIQUE KEY `uq_guide_adapt_unique` (`user_id`, `name`),
  CONSTRAINT `fk_guide_adaptations_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Tours, destinos y reservas
-- ---------------------------------------------------------
CREATE TABLE `tour_categories` (
  `category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_tour_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tour_categories` (`name`) VALUES
('Gastronomía'),
('Arqueología'),
('Arquitectura'),
('Arte y Cultura'),
('Tradicional'),
('Arte Urbano'),
('Entretenimiento'),
('Vida Nocturna'),
('Naturaleza e Historia')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

CREATE TABLE `destinations` (
  `destination_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `city` VARCHAR(120) NOT NULL,
  `state` VARCHAR(120) NULL,
  `country` VARCHAR(120) NOT NULL DEFAULT 'México',
  `description` VARCHAR(255) NULL,
  `image_url` VARCHAR(500) NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`destination_id`),
  UNIQUE KEY `uq_destination_city_state_country` (`city`, `state`, `country`),
  KEY `idx_destinations_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tours` (
  `tour_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NULL,
  `title` VARCHAR(180) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` CHAR(3) NOT NULL DEFAULT 'MXN',
  `duration_hours` DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  `max_group_size` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `meeting_point` VARCHAR(255) NULL,
  `status` ENUM('draft','pending','active','inactive') NOT NULL DEFAULT 'draft',
  `cover_image_url` VARCHAR(500) NULL,
  `image_class` VARCHAR(80) NULL,
  `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `bookings_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tour_id`),
  KEY `idx_tours_guide_status` (`guide_id`, `status`),
  KEY `idx_tours_category` (`category_id`),
  KEY `idx_tours_rating` (`rating_avg`),
  CONSTRAINT `fk_tours_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tours_category`
    FOREIGN KEY (`category_id`)
    REFERENCES `tour_categories` (`category_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `chk_tours_price_non_negative`
    CHECK (`price` >= 0),
  CONSTRAINT `chk_tours_duration_positive`
    CHECK (`duration_hours` > 0),
  CONSTRAINT `chk_tours_group_size_positive`
    CHECK (`max_group_size` > 0),
  CONSTRAINT `chk_tours_rating`
    CHECK (`rating_avg` >= 0 AND `rating_avg` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tour_included_items` (
  `item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `item_text` VARCHAR(180) NOT NULL,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`item_id`),
  KEY `idx_tour_items_tour` (`tour_id`, `sort_order`),
  CONSTRAINT `fk_tour_included_items_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `tours` (`tour_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tour_destinations` (
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `destination_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`tour_id`, `destination_id`),
  KEY `idx_tour_destinations_destination` (`destination_id`),
  CONSTRAINT `fk_tour_destinations_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `tours` (`tour_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tour_destinations_destination`
    FOREIGN KEY (`destination_id`)
    REFERENCES `destinations` (`destination_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `trip_bookings` (
  `trip_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NOT NULL,
  `status` ENUM('pending','confirmed','completed','cancelled','change_requested') NOT NULL DEFAULT 'pending',
  `cancel_reason` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`trip_id`),
  UNIQUE KEY `uq_trip_unique_slot` (`tour_id`, `tourist_id`, `start_datetime`),
  KEY `idx_trip_bookings_tourist_status` (`tourist_id`, `status`),
  KEY `idx_trip_bookings_guide_status` (`guide_id`, `status`),
  KEY `idx_trip_bookings_start` (`start_datetime`),
  CONSTRAINT `fk_trip_bookings_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `tours` (`tour_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_trip_bookings_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_trip_bookings_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `chk_trip_dates`
    CHECK (`end_datetime` > `start_datetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `trip_status_history` (
  `history_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trip_id` BIGINT UNSIGNED NOT NULL,
  `old_status` ENUM('pending','confirmed','completed','cancelled','change_requested') NULL,
  `new_status` ENUM('pending','confirmed','completed','cancelled','change_requested') NOT NULL,
  `reason` VARCHAR(255) NULL,
  `changed_by_user_id` BIGINT UNSIGNED NOT NULL,
  `changed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `idx_trip_status_history_trip` (`trip_id`, `changed_at`),
  CONSTRAINT `fk_trip_status_history_trip`
    FOREIGN KEY (`trip_id`)
    REFERENCES `trip_bookings` (`trip_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_trip_status_history_user`
    FOREIGN KEY (`changed_by_user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guide_calendar_events` (
  `event_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `trip_id` BIGINT UNSIGNED NULL,
  `event_type` ENUM('booked','blocked') NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NOT NULL,
  `organizer_name` VARCHAR(150) NULL,
  `source` ENUM('manual','google','trip') NOT NULL DEFAULT 'manual',
  `status` ENUM('active','cancelled') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  KEY `idx_guide_calendar_guide_start` (`guide_id`, `start_datetime`),
  KEY `idx_guide_calendar_trip` (`trip_id`),
  CONSTRAINT `fk_guide_calendar_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_guide_calendar_trip`
    FOREIGN KEY (`trip_id`)
    REFERENCES `trip_bookings` (`trip_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `chk_calendar_dates`
    CHECK (`end_datetime` > `start_datetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Favoritos, reseñas, chat y notificaciones
-- ---------------------------------------------------------
CREATE TABLE `favorite_guides` (
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tourist_id`, `guide_id`),
  KEY `idx_favorite_guides_guide` (`guide_id`),
  CONSTRAINT `fk_favorite_guides_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_favorite_guides_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `favorite_tours` (
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tourist_id`, `tour_id`),
  KEY `idx_favorite_tours_tour` (`tour_id`),
  CONSTRAINT `fk_favorite_tours_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_favorite_tours_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `tours` (`tour_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reviews` (
  `review_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trip_id` BIGINT UNSIGNED NOT NULL,
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `comment` TEXT NULL,
  `likes_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `replies_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `uq_reviews_trip_tourist` (`trip_id`, `tourist_id`),
  KEY `idx_reviews_guide_created` (`guide_id`, `created_at`),
  KEY `idx_reviews_tourist_created` (`tourist_id`, `created_at`),
  KEY `idx_reviews_tour` (`tour_id`),
  CONSTRAINT `fk_reviews_trip`
    FOREIGN KEY (`trip_id`)
    REFERENCES `trip_bookings` (`trip_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `tours` (`tour_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `chk_reviews_rating`
    CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `review_replies` (
  `reply_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `review_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`reply_id`),
  UNIQUE KEY `uq_review_replies_review` (`review_id`),
  KEY `idx_review_replies_guide` (`guide_id`),
  CONSTRAINT `fk_review_replies_review`
    FOREIGN KEY (`review_id`)
    REFERENCES `reviews` (`review_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_review_replies_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat_threads` (
  `thread_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trip_id` BIGINT UNSIGNED NULL,
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `last_message_at` DATETIME NULL,
  `status` ENUM('active','archived','blocked') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`thread_id`),
  UNIQUE KEY `uq_chat_threads_trip_pair` (`trip_id`, `tourist_id`, `guide_id`),
  KEY `idx_chat_threads_tourist` (`tourist_id`),
  KEY `idx_chat_threads_guide` (`guide_id`),
  KEY `idx_chat_threads_last_message` (`last_message_at`),
  CONSTRAINT `fk_chat_threads_trip`
    FOREIGN KEY (`trip_id`)
    REFERENCES `trip_bookings` (`trip_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_threads_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_threads_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat_messages` (
  `message_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thread_id` BIGINT UNSIGNED NOT NULL,
  `sender_user_id` BIGINT UNSIGNED NOT NULL,
  `body` TEXT NOT NULL,
  `message_type` ENUM('text','system','file') NOT NULL DEFAULT 'text',
  `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` DATETIME NULL,
  PRIMARY KEY (`message_id`),
  KEY `idx_chat_messages_thread_sent` (`thread_id`, `sent_at`),
  KEY `idx_chat_messages_thread_read` (`thread_id`, `read_at`),
  KEY `idx_chat_messages_sender` (`sender_user_id`),
  CONSTRAINT `fk_chat_messages_thread`
    FOREIGN KEY (`thread_id`)
    REFERENCES `chat_threads` (`thread_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_messages_sender`
    FOREIGN KEY (`sender_user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `notification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(60) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `body` TEXT NULL,
  `related_entity_type` VARCHAR(60) NULL,
  `related_entity_id` BIGINT UNSIGNED NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` DATETIME NULL,
  PRIMARY KEY (`notification_id`),
  KEY `idx_notifications_user_read_created` (`user_id`, `is_read`, `created_at`),
  CONSTRAINT `fk_notifications_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Soporte y FAQ
-- ---------------------------------------------------------
CREATE TABLE `support_tickets` (
  `ticket_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `role_context` ENUM('guide','tourist','guest') NOT NULL DEFAULT 'guest',
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `subject` VARCHAR(180) NOT NULL,
  `category` ENUM('reservas_viajes','pagos_facturacion','cuenta_seguridad','verificacion_guias','otro','general') NOT NULL DEFAULT 'general',
  `message` TEXT NOT NULL,
  `status` ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_id`),
  KEY `idx_support_tickets_user_status` (`user_id`, `status`),
  KEY `idx_support_tickets_email` (`email`),
  CONSTRAINT `fk_support_tickets_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `support_ticket_attachments` (
  `attachment_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` BIGINT UNSIGNED NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NULL,
  `file_size_bytes` BIGINT UNSIGNED NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  KEY `idx_support_ticket_attachments_ticket` (`ticket_id`),
  CONSTRAINT `fk_support_ticket_attachments_ticket`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `support_tickets` (`ticket_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faq_categories` (
  `faq_category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `role_scope` ENUM('guide','tourist','both') NOT NULL DEFAULT 'both',
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`faq_category_id`),
  UNIQUE KEY `uq_faq_categories_name_scope` (`name`, `role_scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faq_items` (
  `faq_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `faq_category_id` INT UNSIGNED NOT NULL,
  `question` VARCHAR(300) NOT NULL,
  `answer` TEXT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`faq_item_id`),
  KEY `idx_faq_items_category_active` (`faq_category_id`, `is_active`, `sort_order`),
  CONSTRAINT `fk_faq_items_category`
    FOREIGN KEY (`faq_category_id`)
    REFERENCES `faq_categories` (`faq_category_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Ingresos (sin gateway/pasarela)
-- ---------------------------------------------------------
CREATE TABLE `income_transactions` (
  `transaction_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `trip_id` BIGINT UNSIGNED NULL,
  `tour_id` BIGINT UNSIGNED NULL,
  `txn_type` ENUM('booking_income','withdrawal','refund','adjustment') NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `sign` ENUM('credit','debit') NOT NULL,
  `status` ENUM('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `description` VARCHAR(255) NULL,
  `occurred_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_income_transactions_guide_date` (`guide_id`, `occurred_at`),
  KEY `idx_income_transactions_status` (`status`),
  CONSTRAINT `fk_income_transactions_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_income_transactions_trip`
    FOREIGN KEY (`trip_id`)
    REFERENCES `trip_bookings` (`trip_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_income_transactions_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `tours` (`tour_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `chk_income_transactions_amount_positive`
    CHECK (`amount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `withdrawal_requests` (
  `withdrawal_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `requested_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending','approved','rejected','paid','cancelled') NOT NULL DEFAULT 'pending',
  `bank_reference` VARCHAR(100) NULL,
  `notes` VARCHAR(255) NULL,
  `requested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` DATETIME NULL,
  `processed_by_user_id` BIGINT UNSIGNED NULL,
  PRIMARY KEY (`withdrawal_id`),
  KEY `idx_withdrawal_requests_guide_status` (`guide_id`, `status`),
  CONSTRAINT `fk_withdrawal_requests_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_withdrawal_requests_processed_by`
    FOREIGN KEY (`processed_by_user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `chk_withdrawal_requests_amount_positive`
    CHECK (`requested_amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Perfilador / matching
-- ---------------------------------------------------------
CREATE TABLE `compatibility_profiles` (
  `compatibility_profile_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `role` ENUM('traveler','guide') NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `img_url` VARCHAR(500) NULL,
  `description` TEXT NULL,
  `email` VARCHAR(190) NULL,
  `date_of_birth` DATE NULL,
  `phone_country_code` VARCHAR(8) NULL,
  `phone_number` VARCHAR(20) NULL,
  `phone_e164` VARCHAR(24) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`compatibility_profile_id`),
  KEY `idx_compatibility_profiles_user` (`user_id`),
  KEY `idx_compatibility_profiles_role` (`role`),
  CONSTRAINT `fk_compatibility_profiles_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `compatibility_answers` (
  `answer_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `compatibility_profile_id` BIGINT UNSIGNED NOT NULL,
  `question_key` VARCHAR(100) NOT NULL,
  `value_text` TEXT NULL,
  `value_number` DECIMAL(10,2) NULL,
  `value_json` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`answer_id`),
  UNIQUE KEY `uq_compatibility_answers_profile_question` (`compatibility_profile_id`, `question_key`),
  KEY `idx_compatibility_answers_question` (`question_key`),
  CONSTRAINT `fk_compatibility_answers_profile`
    FOREIGN KEY (`compatibility_profile_id`)
    REFERENCES `compatibility_profiles` (`compatibility_profile_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Sitio público (contacto / newsletter)
-- ---------------------------------------------------------
CREATE TABLE `contact_messages` (
  `contact_message_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `subject` VARCHAR(180) NOT NULL,
  `message` TEXT NOT NULL,
  `source_page` VARCHAR(120) NULL,
  `status` ENUM('new','read','archived') NOT NULL DEFAULT 'new',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`contact_message_id`),
  KEY `idx_contact_messages_status_created` (`status`, `created_at`),
  KEY `idx_contact_messages_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `newsletter_subscriptions` (
  `subscription_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(190) NOT NULL,
  `source_page` VARCHAR(120) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` DATETIME NULL,
  PRIMARY KEY (`subscription_id`),
  UNIQUE KEY `uq_newsletter_email` (`email`),
  KEY `idx_newsletter_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
