-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema kin_conecta
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema kin_conecta
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `kin_conecta` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `kin_conecta` ;

-- -----------------------------------------------------
-- Table `kin_conecta`.`income_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`income_transactions` (
  `transaction_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `trip_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `tour_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `txn_type` ENUM('booking_income', 'withdrawal', 'refund', 'adjustment') NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `sign` ENUM('credit', 'debit') NOT NULL,
  `status` ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `occurred_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  INDEX `idx_income_transactions_guide_date` (`guide_id` ASC, `occurred_at` ASC) VISIBLE,
  INDEX `idx_income_transactions_status` (`status` ASC) VISIBLE,
  INDEX `fk_income_transactions_trip` (`trip_id` ASC) VISIBLE,
  INDEX `fk_income_transactions_tour` (`tour_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`newsletter_subscriptions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`newsletter_subscriptions` (
  `subscription_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(190) NOT NULL,
  `source_page` VARCHAR(120) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`subscription_id`),
  UNIQUE INDEX `uq_newsletter_email` (`email` ASC) VISIBLE,
  INDEX `idx_newsletter_active` (`is_active` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`languages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`languages` (
  `language_code` CHAR(8) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`language_code`),
  UNIQUE INDEX `uq_languages_name` (`name` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`users` (
  `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role` ENUM('tourist', 'guide', 'admin') NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `date_of_birth` DATE NULL DEFAULT NULL,
  `email` VARCHAR(190) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `country_code` VARCHAR(8) NULL DEFAULT NULL,
  `phone_number` VARCHAR(20) NULL DEFAULT NULL,
  `phone_e164` VARCHAR(24) NULL DEFAULT NULL,
  `preferred_language_code` CHAR(8) NULL DEFAULT NULL,
  `account_status` ENUM('pending', 'active', 'suspended', 'deleted') NOT NULL DEFAULT 'active',
  `email_verified_at` DATETIME NULL DEFAULT NULL,
  `last_login_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `uq_users_email` (`email` ASC) VISIBLE,
  UNIQUE INDEX `uq_users_phone_e164` (`phone_e164` ASC) VISIBLE,
  INDEX `idx_users_role` (`role` ASC) VISIBLE,
  INDEX `idx_users_status` (`account_status` ASC) VISIBLE,
  INDEX `idx_users_created_at` (`created_at` ASC) VISIBLE,
  INDEX `fk_users_language` (`preferred_language_code` ASC) VISIBLE,
  CONSTRAINT `fk_users_language`
    FOREIGN KEY (`preferred_language_code`)
    REFERENCES `kin_conecta`.`languages` (`language_code`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`auth_sessions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`auth_sessions` (
  `session_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked_at` DATETIME NULL DEFAULT NULL,
  `ip` VARCHAR(45) NULL DEFAULT NULL,
  `user_agent` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  UNIQUE INDEX `uq_auth_sessions_token_hash` (`token_hash` ASC) VISIBLE,
  INDEX `idx_auth_sessions_user` (`user_id` ASC) VISIBLE,
  INDEX `idx_auth_sessions_expires_at` (`expires_at` ASC) VISIBLE,
  CONSTRAINT `fk_auth_sessions_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`tourist_profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`tourist_profiles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `location` VARCHAR(150) NULL DEFAULT NULL,
  `bio` TEXT NULL DEFAULT NULL,
  `member_since` DATE NULL DEFAULT NULL,
  `badge` VARCHAR(100) NULL DEFAULT NULL,
  `travel_style` VARCHAR(200) NULL DEFAULT NULL,
  `trip_type` VARCHAR(200) NULL DEFAULT NULL,
  `pace_and_company` VARCHAR(255) NULL DEFAULT NULL,
  `activity_level` ENUM('Bajo', 'Moderado', 'Alto') NULL DEFAULT NULL,
  `group_preference` VARCHAR(200) NULL DEFAULT NULL,
  `dietary_preferences` VARCHAR(255) NULL DEFAULT NULL,
  `planning_level` ENUM('Bajo', 'Intermedio', 'Alto') NULL DEFAULT NULL,
  `amenities` VARCHAR(255) NULL DEFAULT NULL,
  `transport` VARCHAR(255) NULL DEFAULT NULL,
  `photo_preference` VARCHAR(255) NULL DEFAULT NULL,
  `accessibility` VARCHAR(255) NULL DEFAULT NULL,
  `additional_notes` TEXT NULL DEFAULT NULL,
  `avatar_url` VARCHAR(500) NULL DEFAULT NULL,
  `cover_url` VARCHAR(500) NULL DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_tourist_profiles_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`guide_profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`guide_profiles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `summary` TEXT NULL DEFAULT NULL,
  `story` TEXT NULL DEFAULT NULL,
  `status_text` VARCHAR(80) NULL DEFAULT NULL,
  `hourly_rate` DECIMAL(10,2) NULL DEFAULT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'MXN',
  `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `reviews_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `location_label` VARCHAR(150) NULL DEFAULT NULL,
  `experience_level` VARCHAR(120) NULL DEFAULT NULL,
  `style` TEXT NULL DEFAULT NULL,
  `group_size` VARCHAR(120) NULL DEFAULT NULL,
  `tour_intensity` VARCHAR(120) NULL DEFAULT NULL,
  `transport_offered` VARCHAR(255) NULL DEFAULT NULL,
  `photo_style` VARCHAR(255) NULL DEFAULT NULL,
  `additional_notes` TEXT NULL DEFAULT NULL,
  `avatar_url` VARCHAR(500) NULL DEFAULT NULL,
  `cover_url` VARCHAR(500) NULL DEFAULT NULL,
  `post_text` TEXT NULL DEFAULT NULL,
  `post_image_url` VARCHAR(500) NULL DEFAULT NULL,
  `post_caption` VARCHAR(255) NULL DEFAULT NULL,
  `post_published_at` DATETIME NULL DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  INDEX `idx_guide_profiles_rating` (`rating_avg` ASC) VISIBLE,
  CONSTRAINT `fk_guide_profiles_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`tourist_profile_languages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`tourist_profile_languages` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `language_code` CHAR(8) NOT NULL,
  PRIMARY KEY (`user_id`, `language_code`),
  INDEX `idx_tpl_language` (`language_code` ASC) VISIBLE,
  CONSTRAINT `fk_tpl_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`tourist_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tpl_language`
    FOREIGN KEY (`language_code`)
    REFERENCES `kin_conecta`.`languages` (`language_code`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`guide_profile_languages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`guide_profile_languages` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `language_code` CHAR(8) NOT NULL,
  PRIMARY KEY (`user_id`, `language_code`),
  INDEX `idx_gpl_language` (`language_code` ASC) VISIBLE,
  CONSTRAINT `fk_gpl_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_gpl_language`
    FOREIGN KEY (`language_code`)
    REFERENCES `kin_conecta`.`languages` (`language_code`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`interests`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`interests` (
  `interest_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`interest_id`),
  UNIQUE INDEX `uq_interests_name` (`name` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`tourist_profile_interests`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`tourist_profile_interests` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `interest_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `interest_id`),
  INDEX `idx_tpi_interest` (`interest_id` ASC) VISIBLE,
  CONSTRAINT `fk_tpi_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`tourist_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tpi_interest`
    FOREIGN KEY (`interest_id`)
    REFERENCES `kin_conecta`.`interests` (`interest_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`guide_expertise_areas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`guide_expertise_areas` (
  `expertise_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`expertise_id`),
  UNIQUE INDEX `uq_guide_expertise_name` (`name` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`guide_profile_expertise`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`guide_profile_expertise` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `expertise_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `expertise_id`),
  INDEX `idx_gpe_expertise` (`expertise_id` ASC) VISIBLE,
  CONSTRAINT `fk_gpe_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_gpe_expertise`
    FOREIGN KEY (`expertise_id`)
    REFERENCES `kin_conecta`.`guide_expertise_areas` (`expertise_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`guide_locations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`guide_locations` (
  `guide_location_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `location_name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`guide_location_id`),
  UNIQUE INDEX `uq_guide_location_unique` (`user_id` ASC, `location_name` ASC) VISIBLE,
  INDEX `idx_guide_location_name` (`location_name` ASC) VISIBLE,
  CONSTRAINT `fk_guide_locations_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`guide_certifications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`guide_certifications` (
  `certification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`certification_id`),
  UNIQUE INDEX `uq_guide_cert_unique` (`user_id` ASC, `name` ASC) VISIBLE,
  CONSTRAINT `fk_guide_certifications_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`guide_adaptations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`guide_adaptations` (
  `adaptation_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`adaptation_id`),
  UNIQUE INDEX `uq_guide_adapt_unique` (`user_id` ASC, `name` ASC) VISIBLE,
  CONSTRAINT `fk_guide_adaptations_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`guide_profiles` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`tour_categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`tour_categories` (
  `category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE INDEX `uq_tour_categories_name` (`name` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`destinations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`destinations` (
  `destination_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `city` VARCHAR(120) NOT NULL,
  `state` VARCHAR(120) NULL DEFAULT NULL,
  `country` VARCHAR(120) NOT NULL DEFAULT 'México',
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `image_url` VARCHAR(500) NULL DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`destination_id`),
  UNIQUE INDEX `uq_destination_city_state_country` (`city` ASC, `state` ASC, `country` ASC) VISIBLE,
  INDEX `idx_destinations_featured` (`is_featured` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`tours`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`tours` (
  `tour_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NULL DEFAULT NULL,
  `title` VARCHAR(180) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` CHAR(3) NOT NULL DEFAULT 'MXN',
  `duration_hours` DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  `max_group_size` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `meeting_point` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('draft', 'pending', 'active', 'inactive') NOT NULL DEFAULT 'draft',
  `cover_image_url` VARCHAR(500) NULL DEFAULT NULL,
  `image_class` VARCHAR(80) NULL DEFAULT NULL,
  `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `bookings_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tour_id`),
  INDEX `idx_tours_guide_status` (`guide_id` ASC, `status` ASC) VISIBLE,
  INDEX `idx_tours_category` (`category_id` ASC) VISIBLE,
  INDEX `idx_tours_rating` (`rating_avg` ASC) VISIBLE,
  CONSTRAINT `fk_tours_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tours_category`
    FOREIGN KEY (`category_id`)
    REFERENCES `kin_conecta`.`tour_categories` (`category_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`tour_included_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`tour_included_items` (
  `item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `item_text` VARCHAR(180) NOT NULL,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`item_id`),
  INDEX `idx_tour_items_tour` (`tour_id` ASC, `sort_order` ASC) VISIBLE,
  CONSTRAINT `fk_tour_included_items_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `kin_conecta`.`tours` (`tour_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`tour_destinations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`tour_destinations` (
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `destination_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`tour_id`, `destination_id`),
  INDEX `idx_tour_destinations_destination` (`destination_id` ASC) VISIBLE,
  CONSTRAINT `fk_tour_destinations_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `kin_conecta`.`tours` (`tour_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tour_destinations_destination`
    FOREIGN KEY (`destination_id`)
    REFERENCES `kin_conecta`.`destinations` (`destination_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`trip_bookings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`trip_bookings` (
  `trip_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NOT NULL,
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled', 'change_requested') NOT NULL DEFAULT 'pending',
  `cancel_reason` VARCHAR(255) NULL DEFAULT NULL,
  `notes` TEXT NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`trip_id`),
  UNIQUE INDEX `uq_trip_unique_slot` (`tour_id` ASC, `tourist_id` ASC, `start_datetime` ASC) VISIBLE,
  INDEX `idx_trip_bookings_tourist_status` (`tourist_id` ASC, `status` ASC) VISIBLE,
  INDEX `idx_trip_bookings_guide_status` (`guide_id` ASC, `status` ASC) VISIBLE,
  INDEX `idx_trip_bookings_start` (`start_datetime` ASC) VISIBLE,
  CONSTRAINT `fk_trip_bookings_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `kin_conecta`.`tours` (`tour_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_trip_bookings_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_trip_bookings_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`trip_status_history`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`trip_status_history` (
  `history_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trip_id` BIGINT UNSIGNED NOT NULL,
  `old_status` ENUM('pending', 'confirmed', 'completed', 'cancelled', 'change_requested') NULL DEFAULT NULL,
  `new_status` ENUM('pending', 'confirmed', 'completed', 'cancelled', 'change_requested') NOT NULL,
  `reason` VARCHAR(255) NULL DEFAULT NULL,
  `changed_by_user_id` BIGINT UNSIGNED NOT NULL,
  `changed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  INDEX `idx_trip_status_history_trip` (`trip_id` ASC, `changed_at` ASC) VISIBLE,
  INDEX `fk_trip_status_history_user` (`changed_by_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_trip_status_history_trip`
    FOREIGN KEY (`trip_id`)
    REFERENCES `kin_conecta`.`trip_bookings` (`trip_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_trip_status_history_user`
    FOREIGN KEY (`changed_by_user_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`guide_calendar_events`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`guide_calendar_events` (
  `event_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `trip_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `event_type` ENUM('booked', 'blocked') NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NOT NULL,
  `organizer_name` VARCHAR(150) NULL DEFAULT NULL,
  `source` ENUM('manual', 'google', 'trip') NOT NULL DEFAULT 'manual',
  `status` ENUM('active', 'cancelled') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  INDEX `idx_guide_calendar_guide_start` (`guide_id` ASC, `start_datetime` ASC) VISIBLE,
  INDEX `idx_guide_calendar_trip` (`trip_id` ASC) VISIBLE,
  CONSTRAINT `fk_guide_calendar_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_guide_calendar_trip`
    FOREIGN KEY (`trip_id`)
    REFERENCES `kin_conecta`.`trip_bookings` (`trip_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`favorite_guides`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`favorite_guides` (
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tourist_id`, `guide_id`),
  INDEX `idx_favorite_guides_guide` (`guide_id` ASC) VISIBLE,
  CONSTRAINT `fk_favorite_guides_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_favorite_guides_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`favorite_tours`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`favorite_tours` (
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tourist_id`, `tour_id`),
  INDEX `idx_favorite_tours_tour` (`tour_id` ASC) VISIBLE,
  CONSTRAINT `fk_favorite_tours_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_favorite_tours_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `kin_conecta`.`tours` (`tour_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`reviews`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`reviews` (
  `review_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trip_id` BIGINT UNSIGNED NOT NULL,
  `tour_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `comment` TEXT NULL DEFAULT NULL,
  `likes_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `replies_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`review_id`),
  UNIQUE INDEX `uq_reviews_trip_tourist` (`trip_id` ASC, `tourist_id` ASC) VISIBLE,
  INDEX `idx_reviews_guide_created` (`guide_id` ASC, `created_at` ASC) VISIBLE,
  INDEX `idx_reviews_tourist_created` (`tourist_id` ASC, `created_at` ASC) VISIBLE,
  INDEX `idx_reviews_tour` (`tour_id` ASC) VISIBLE,
  CONSTRAINT `fk_reviews_trip`
    FOREIGN KEY (`trip_id`)
    REFERENCES `kin_conecta`.`trip_bookings` (`trip_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_tour`
    FOREIGN KEY (`tour_id`)
    REFERENCES `kin_conecta`.`tours` (`tour_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`review_replies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`review_replies` (
  `reply_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `review_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`reply_id`),
  UNIQUE INDEX `uq_review_replies_review` (`review_id` ASC) VISIBLE,
  INDEX `idx_review_replies_guide` (`guide_id` ASC) VISIBLE,
  CONSTRAINT `fk_review_replies_review`
    FOREIGN KEY (`review_id`)
    REFERENCES `kin_conecta`.`reviews` (`review_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_review_replies_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`chat_threads`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`chat_threads` (
  `thread_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trip_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `tourist_id` BIGINT UNSIGNED NOT NULL,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `last_message_at` DATETIME NULL DEFAULT NULL,
  `status` ENUM('active', 'archived', 'blocked') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`thread_id`),
  UNIQUE INDEX `uq_chat_threads_trip_pair` (`trip_id` ASC, `tourist_id` ASC, `guide_id` ASC) VISIBLE,
  INDEX `idx_chat_threads_tourist` (`tourist_id` ASC) VISIBLE,
  INDEX `idx_chat_threads_guide` (`guide_id` ASC) VISIBLE,
  INDEX `idx_chat_threads_last_message` (`last_message_at` ASC) VISIBLE,
  CONSTRAINT `fk_chat_threads_trip`
    FOREIGN KEY (`trip_id`)
    REFERENCES `kin_conecta`.`trip_bookings` (`trip_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_threads_tourist`
    FOREIGN KEY (`tourist_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_threads_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`chat_messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`chat_messages` (
  `message_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thread_id` BIGINT UNSIGNED NOT NULL,
  `sender_user_id` BIGINT UNSIGNED NOT NULL,
  `body` TEXT NOT NULL,
  `message_type` ENUM('text', 'system', 'file') NOT NULL DEFAULT 'text',
  `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  INDEX `idx_chat_messages_thread_sent` (`thread_id` ASC, `sent_at` ASC) VISIBLE,
  INDEX `idx_chat_messages_thread_read` (`thread_id` ASC, `read_at` ASC) VISIBLE,
  INDEX `idx_chat_messages_sender` (`sender_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_chat_messages_thread`
    FOREIGN KEY (`thread_id`)
    REFERENCES `kin_conecta`.`chat_threads` (`thread_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_chat_messages_sender`
    FOREIGN KEY (`sender_user_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`notifications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`notifications` (
  `notification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` VARCHAR(60) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `body` TEXT NULL DEFAULT NULL,
  `related_entity_type` VARCHAR(60) NULL DEFAULT NULL,
  `related_entity_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  INDEX `idx_notifications_user_read_created` (`user_id` ASC, `is_read` ASC, `created_at` ASC) VISIBLE,
  CONSTRAINT `fk_notifications_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`support_tickets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`support_tickets` (
  `ticket_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `role_context` ENUM('guide', 'tourist', 'guest') NOT NULL DEFAULT 'guest',
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `subject` VARCHAR(180) NOT NULL,
  `category` ENUM('reservas_viajes', 'pagos_facturacion', 'cuenta_seguridad', 'verificacion_guias', 'otro', 'general') NOT NULL DEFAULT 'general',
  `message` TEXT NOT NULL,
  `status` ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_id`),
  INDEX `idx_support_tickets_user_status` (`user_id` ASC, `status` ASC) VISIBLE,
  INDEX `idx_support_tickets_email` (`email` ASC) VISIBLE,
  CONSTRAINT `fk_support_tickets_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`support_ticket_attachments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`support_ticket_attachments` (
  `attachment_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` BIGINT UNSIGNED NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NULL DEFAULT NULL,
  `file_size_bytes` BIGINT UNSIGNED NULL DEFAULT NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  INDEX `idx_support_ticket_attachments_ticket` (`ticket_id` ASC) VISIBLE,
  CONSTRAINT `fk_support_ticket_attachments_ticket`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `kin_conecta`.`support_tickets` (`ticket_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`faq_categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`faq_categories` (
  `faq_category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `role_scope` ENUM('guide', 'tourist', 'both') NOT NULL DEFAULT 'both',
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`faq_category_id`),
  UNIQUE INDEX `uq_faq_categories_name_scope` (`name` ASC, `role_scope` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`faq_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`faq_items` (
  `faq_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `faq_category_id` INT UNSIGNED NOT NULL,
  `question` VARCHAR(300) NOT NULL,
  `answer` TEXT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`faq_item_id`),
  INDEX `idx_faq_items_category_active` (`faq_category_id` ASC, `is_active` ASC, `sort_order` ASC) VISIBLE,
  CONSTRAINT `fk_faq_items_category`
    FOREIGN KEY (`faq_category_id`)
    REFERENCES `kin_conecta`.`faq_categories` (`faq_category_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`withdrawal_requests`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`withdrawal_requests` (
  `withdrawal_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guide_id` BIGINT UNSIGNED NOT NULL,
  `requested_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  `bank_reference` VARCHAR(100) NULL DEFAULT NULL,
  `notes` VARCHAR(255) NULL DEFAULT NULL,
  `requested_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` DATETIME NULL DEFAULT NULL,
  `processed_by_user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`withdrawal_id`),
  INDEX `idx_withdrawal_requests_guide_status` (`guide_id` ASC, `status` ASC) VISIBLE,
  INDEX `fk_withdrawal_requests_processed_by` (`processed_by_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_withdrawal_requests_guide`
    FOREIGN KEY (`guide_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_withdrawal_requests_processed_by`
    FOREIGN KEY (`processed_by_user_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`compatibility_profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`compatibility_profiles` (
  `compatibility_profile_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `role` ENUM('traveler', 'guide') NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `img_url` VARCHAR(500) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `email` VARCHAR(190) NULL DEFAULT NULL,
  `date_of_birth` DATE NULL DEFAULT NULL,
  `phone_country_code` VARCHAR(8) NULL DEFAULT NULL,
  `phone_number` VARCHAR(20) NULL DEFAULT NULL,
  `phone_e164` VARCHAR(24) NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`compatibility_profile_id`),
  INDEX `idx_compatibility_profiles_user` (`user_id` ASC) VISIBLE,
  INDEX `idx_compatibility_profiles_role` (`role` ASC) VISIBLE,
  CONSTRAINT `fk_compatibility_profiles_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `kin_conecta`.`users` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`compatibility_answers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`compatibility_answers` (
  `answer_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `compatibility_profile_id` BIGINT UNSIGNED NOT NULL,
  `question_key` VARCHAR(100) NOT NULL,
  `value_text` TEXT NULL DEFAULT NULL,
  `value_number` DECIMAL(10,2) NULL DEFAULT NULL,
  `value_json` JSON NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`answer_id`),
  UNIQUE INDEX `uq_compatibility_answers_profile_question` (`compatibility_profile_id` ASC, `question_key` ASC) VISIBLE,
  INDEX `idx_compatibility_answers_question` (`question_key` ASC) VISIBLE,
  CONSTRAINT `fk_compatibility_answers_profile`
    FOREIGN KEY (`compatibility_profile_id`)
    REFERENCES `kin_conecta`.`compatibility_profiles` (`compatibility_profile_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `kin_conecta`.`contact_messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kin_conecta`.`contact_messages` (
  `contact_message_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `subject` VARCHAR(180) NOT NULL,
  `message` TEXT NOT NULL,
  `source_page` VARCHAR(120) NULL DEFAULT NULL,
  `status` ENUM('new', 'read', 'archived') NOT NULL DEFAULT 'new',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`contact_message_id`),
  INDEX `idx_contact_messages_status_created` (`status` ASC, `created_at` ASC) VISIBLE,
  INDEX `idx_contact_messages_email` (`email` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
