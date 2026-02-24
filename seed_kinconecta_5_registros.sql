USE `kin_conecta`;

START TRANSACTION;

INSERT INTO `languages` (`language_code`, `name`) VALUES
('es', 'Espanol'),
('en', 'English'),
('fr', 'Francais'),
('de', 'Deutsch'),
('it', 'Italiano');

INSERT INTO `users` (
  `user_id`, `role`, `full_name`, `date_of_birth`, `email`, `password_hash`,
  `country_code`, `phone_number`, `phone_e164`, `preferred_language_code`,
  `account_status`, `email_verified_at`, `last_login_at`, `created_at`
) VALUES
(1, 'guide', 'Ana Torres', '1990-04-12', 'ana.torres.guia@kinconecta.test', '$2b$12$ana.guide.hash.value.000000000000000000000000000000000000000001', '+52', '5510000001', '+5215510000001', 'es', 'active', '2026-01-10 09:00:00', '2026-02-20 08:15:00', '2026-01-01 10:00:00'),
(2, 'guide', 'Bruno Diaz', '1988-09-03', 'bruno.diaz.guia@kinconecta.test', '$2b$12$bruno.guide.hash.value.00000000000000000000000000000000000000002', '+52', '5510000002', '+5215510000002', 'en', 'active', '2026-01-11 10:00:00', '2026-02-21 09:10:00', '2026-01-02 10:00:00'),
(3, 'guide', 'Carla Ruiz', '1992-01-22', 'carla.ruiz.guia@kinconecta.test', '$2b$12$carla.guide.hash.value.00000000000000000000000000000000000000003', '+52', '5510000003', '+5215510000003', 'fr', 'active', '2026-01-12 11:00:00', '2026-02-22 07:45:00', '2026-01-03 10:00:00'),
(4, 'guide', 'Diego Mendez', '1985-07-15', 'diego.mendez.guia@kinconecta.test', '$2b$12$diego.guide.hash.value.00000000000000000000000000000000000000004', '+52', '5510000004', '+5215510000004', 'de', 'active', '2026-01-13 12:00:00', '2026-02-22 13:20:00', '2026-01-04 10:00:00'),
(5, 'guide', 'Elena Flores', '1994-11-30', 'elena.flores.guia@kinconecta.test', '$2b$12$elena.guide.hash.value.00000000000000000000000000000000000000005', '+52', '5510000005', '+5215510000005', 'it', 'active', '2026-01-14 13:00:00', '2026-02-23 18:05:00', '2026-01-05 10:00:00');

INSERT INTO `auth_sessions` (`session_id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`, `ip`, `user_agent`, `created_at`) VALUES
(1, 1, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '2026-03-31 23:59:59', NULL, '189.203.10.1', 'Mozilla/5.0 KinConectaWeb', '2026-02-20 08:20:00'),
(2, 2, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', '2026-03-31 23:59:59', NULL, '189.203.10.2', 'Mozilla/5.0 KinConectaWeb', '2026-02-21 09:15:00'),
(3, 3, 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', '2026-03-31 23:59:59', NULL, '189.203.10.3', 'Mozilla/5.0 KinConectaWeb', '2026-02-22 07:50:00'),
(4, 4, 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd', '2026-03-31 23:59:59', NULL, '189.203.10.4', 'Mozilla/5.0 KinConectaWeb', '2026-02-22 13:30:00'),
(5, 5, 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '2026-03-31 23:59:59', NULL, '189.203.10.5', 'Mozilla/5.0 KinConectaWeb', '2026-02-23 18:15:00');

INSERT INTO `tourist_profiles` (
  `user_id`, `location`, `bio`, `member_since`, `badge`, `travel_style`,
  `trip_type`, `pace_and_company`, `activity_level`, `group_preference`,
  `dietary_preferences`, `planning_level`, `amenities`, `transport`,
  `photo_preference`, `accessibility`, `additional_notes`, `avatar_url`, `cover_url`
) VALUES
(1, 'Ciudad de Mexico', 'Guia local que tambien viaja por cultura.', '2025-01-10', 'Exploradora', 'Cultural', 'City break', 'Ritmo medio y grupos pequenos', 'Moderado', 'Grupos de 4 a 8', 'Sin restricciones', 'Intermedio', 'Agua y descansos', 'Caminata y metro', 'Arquitectura', 'Sin requerimientos', 'Le gustan museos y mercados.', 'https://cdn.kinconecta.test/avatars/u1.jpg', 'https://cdn.kinconecta.test/covers/u1.jpg'),
(2, 'Guadalajara', 'Especialista en rutas de comida regional.', '2025-01-11', 'Foodie', 'Gastronomico', 'Fin de semana', 'Ritmo relajado en pareja', 'Bajo', 'Pareja o trio', 'Vegetariano ocasional', 'Bajo', 'Paradas para comida', 'Auto y caminata', 'Comida y retratos', 'Sin requerimientos', 'Prefiere experiencias cortas.', 'https://cdn.kinconecta.test/avatars/u2.jpg', 'https://cdn.kinconecta.test/covers/u2.jpg'),
(3, 'Merida', 'Disfruta arquitectura, historia y fotografia.', '2025-01-12', 'Cronista', 'Historico', 'Escapada cultural', 'Ritmo medio con amigos', 'Moderado', 'Grupos de 3 a 6', 'Sin gluten', 'Alto', 'Guia impresa y agua', 'Van compartida', 'Calles coloniales', 'Sin requerimientos', 'Busca recorridos al amanecer.', 'https://cdn.kinconecta.test/avatars/u3.jpg', 'https://cdn.kinconecta.test/covers/u3.jpg'),
(4, 'Oaxaca', 'Amante de arte urbano y tradiciones locales.', '2025-01-13', 'Creativo', 'Artistico', 'Experiencia urbana', 'Ritmo alto en grupo', 'Alto', 'Grupos de 5 a 10', 'Sin lactosa', 'Intermedio', 'Paradas culturales', 'Caminata', 'Murales y mercados', 'Sin requerimientos', 'Le interesan talleres locales.', 'https://cdn.kinconecta.test/avatars/u4.jpg', 'https://cdn.kinconecta.test/covers/u4.jpg'),
(5, 'Cancun', 'Prefiere naturaleza y rutas al aire libre.', '2025-01-14', 'Aventurera', 'Naturaleza', 'Aventura', 'Ritmo alto con equipo pequeno', 'Alto', 'Grupos de 2 a 5', 'Sin restricciones', 'Alto', 'Equipo basico', 'Auto y lancha', 'Paisaje natural', 'Movilidad parcial', 'Busca cenotes con poca afluencia.', 'https://cdn.kinconecta.test/avatars/u5.jpg', 'https://cdn.kinconecta.test/covers/u5.jpg');

INSERT INTO `guide_profiles` (
  `user_id`, `summary`, `story`, `status_text`, `hourly_rate`, `currency`,
  `rating_avg`, `reviews_count`, `location_label`, `experience_level`, `style`,
  `group_size`, `tour_intensity`, `transport_offered`, `photo_style`,
  `additional_notes`, `avatar_url`, `cover_url`, `post_text`, `post_image_url`,
  `post_caption`, `post_published_at`
) VALUES
(1, 'Guia cultural en CDMX.', 'Lleva 8 anos guiando por el centro historico.', 'Disponible esta semana', 450.00, 'MXN', 4.80, 24, 'CDMX Centro', 'Senior', 'Explicaciones historicas y dinamicas', '4-10 personas', 'Moderado', 'Caminata', 'Arquitectura clasica', 'Incluye recomendaciones de museos.', 'https://cdn.kinconecta.test/guides/u1-avatar.jpg', 'https://cdn.kinconecta.test/guides/u1-cover.jpg', 'Nueva ruta por Bellas Artes.', 'https://cdn.kinconecta.test/posts/u1.jpg', 'Tour cultural en tendencia', '2026-02-18 09:30:00'),
(2, 'Guia foodie en Guadalajara.', 'Recorre mercados desde 2017.', 'Agenda abierta', 420.00, 'MXN', 4.70, 19, 'Guadalajara Centro', 'Avanzado', 'Enfoque en cocina local', '2-8 personas', 'Bajo', 'Auto propio', 'Comida y lifestyle', 'Puede adaptar menus.', 'https://cdn.kinconecta.test/guides/u2-avatar.jpg', 'https://cdn.kinconecta.test/guides/u2-cover.jpg', 'Probando puestos nuevos.', 'https://cdn.kinconecta.test/posts/u2.jpg', 'Sabores de temporada', '2026-02-18 11:00:00'),
(3, 'Guia de patrimonio en Merida.', 'Combina historia con fotografia.', 'Responde en menos de 1h', 500.00, 'MXN', 4.90, 31, 'Merida Centro', 'Senior', 'Narrativa historica con paradas visuales', '3-7 personas', 'Moderado', 'Van compartida', 'Colonial y retrato', 'Ideal para viajeros culturales.', 'https://cdn.kinconecta.test/guides/u3-avatar.jpg', 'https://cdn.kinconecta.test/guides/u3-cover.jpg', 'Ruta colonial actualizada.', 'https://cdn.kinconecta.test/posts/u3.jpg', 'Historia viva del centro', '2026-02-19 08:00:00'),
(4, 'Guia de arte urbano en Oaxaca.', 'Coordina recorridos con artistas locales.', 'Cupos limitados', 460.00, 'MXN', 4.60, 15, 'Oaxaca Centro', 'Intermedio', 'Experiencias participativas', '5-12 personas', 'Alto', 'Caminata', 'Street y documental', 'Incluye paradas de cafe local.', 'https://cdn.kinconecta.test/guides/u4-avatar.jpg', 'https://cdn.kinconecta.test/guides/u4-cover.jpg', 'Nuevos murales en Jalatlaco.', 'https://cdn.kinconecta.test/posts/u4.jpg', 'Arte urbano en ruta', '2026-02-19 12:40:00'),
(5, 'Guia de naturaleza en Quintana Roo.', 'Especialista en cenotes y seguridad.', 'Disponible fines de semana', 550.00, 'MXN', 4.95, 28, 'Ruta de Cenotes', 'Senior', 'Aventura segura y educativa', '2-6 personas', 'Alto', 'Auto y equipo de snorkel', 'Naturaleza y accion', 'Requiere bloqueador biodegradable.', 'https://cdn.kinconecta.test/guides/u5-avatar.jpg', 'https://cdn.kinconecta.test/guides/u5-cover.jpg', 'Temporada ideal para amaneceres.', 'https://cdn.kinconecta.test/posts/u5.jpg', 'Cenotes con baja afluencia', '2026-02-20 06:10:00');

INSERT INTO `tourist_profile_languages` (`user_id`, `language_code`) VALUES
(1, 'en'),
(2, 'es'),
(3, 'fr'),
(4, 'de'),
(5, 'it');

INSERT INTO `guide_profile_languages` (`user_id`, `language_code`) VALUES
(1, 'es'),
(2, 'en'),
(3, 'fr'),
(4, 'de'),
(5, 'it');

INSERT INTO `interests` (`interest_id`, `name`) VALUES
(1, 'Cultura'),
(2, 'Gastronomia'),
(3, 'Aventura'),
(4, 'Naturaleza'),
(5, 'Fotografia');

INSERT INTO `tourist_profile_interests` (`user_id`, `interest_id`) VALUES
(1, 1),
(2, 2),
(3, 5),
(4, 1),
(5, 4);

INSERT INTO `guide_expertise_areas` (`expertise_id`, `name`) VALUES
(1, 'Historia local'),
(2, 'Tour gastronomico'),
(3, 'Patrimonio colonial'),
(4, 'Arte urbano'),
(5, 'Cenotes y naturaleza');

INSERT INTO `guide_profile_expertise` (`user_id`, `expertise_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

INSERT INTO `guide_locations` (`guide_location_id`, `user_id`, `location_name`) VALUES
(1, 1, 'Centro Historico CDMX'),
(2, 2, 'Mercado San Juan de Dios'),
(3, 3, 'Paseo de Montejo'),
(4, 4, 'Barrio de Jalatlaco'),
(5, 5, 'Ruta de Cenotes Puerto Morelos');

INSERT INTO `guide_certifications` (`certification_id`, `user_id`, `name`) VALUES
(1, 1, 'Certificado Guia Cultural CDMX'),
(2, 2, 'Certificado Seguridad Alimentaria'),
(3, 3, 'Certificado Historia Regional'),
(4, 4, 'Certificado Turismo Comunitario'),
(5, 5, 'Certificado Primeros Auxilios');

INSERT INTO `guide_adaptations` (`adaptation_id`, `user_id`, `name`) VALUES
(1, 1, 'Ritmo flexible para adultos mayores'),
(2, 2, 'Opciones vegetarianas'),
(3, 3, 'Soporte bilingue'),
(4, 4, 'Paradas de descanso frecuentes'),
(5, 5, 'Equipo extra de seguridad');

INSERT INTO `tour_categories` (`category_id`, `name`) VALUES
(1, 'Historia y cultura'),
(2, 'Gastronomia local'),
(3, 'Arquitectura colonial'),
(4, 'Arte urbano'),
(5, 'Naturaleza');

INSERT INTO `destinations` (`destination_id`, `city`, `state`, `country`, `description`, `image_url`, `is_featured`) VALUES
(1, 'Ciudad de Mexico', 'CDMX', 'Mexico', 'Centro historico y museos.', 'https://cdn.kinconecta.test/destinations/cdmx.jpg', 1),
(2, 'Guadalajara', 'Jalisco', 'Mexico', 'Mercados y cocina local.', 'https://cdn.kinconecta.test/destinations/gdl.jpg', 1),
(3, 'Merida', 'Yucatan', 'Mexico', 'Arquitectura colonial y plazas.', 'https://cdn.kinconecta.test/destinations/merida.jpg', 0),
(4, 'Oaxaca', 'Oaxaca', 'Mexico', 'Arte urbano y tradiciones.', 'https://cdn.kinconecta.test/destinations/oaxaca.jpg', 0),
(5, 'Puerto Morelos', 'Quintana Roo', 'Mexico', 'Cenotes y naturaleza.', 'https://cdn.kinconecta.test/destinations/pmorelos.jpg', 1);

INSERT INTO `tours` (
  `tour_id`, `guide_id`, `category_id`, `title`, `description`, `price`, `currency`,
  `duration_hours`, `max_group_size`, `meeting_point`, `status`, `cover_image_url`,
  `image_class`, `rating_avg`, `bookings_count`, `created_at`
) VALUES
(1, 1, 1, 'Centro Historico y Museos', 'Recorrido por edificios iconicos y museos clave.', 850.00, 'MXN', 4.0, 8, 'Palacio de Bellas Artes', 'active', 'https://cdn.kinconecta.test/tours/t1.jpg', 'cover-historic', 4.80, 1, '2026-02-01 09:00:00'),
(2, 2, 2, 'Ruta de Tacos y Mercados', 'Degustacion guiada en mercados tradicionales.', 780.00, 'MXN', 4.0, 6, 'Mercado Libertad', 'active', 'https://cdn.kinconecta.test/tours/t2.jpg', 'cover-food', 4.70, 1, '2026-02-02 10:00:00'),
(3, 3, 3, 'Paseo Colonial en Merida', 'Historia, arquitectura y fotografia urbana.', 920.00, 'MXN', 4.0, 7, 'Catedral de Merida', 'active', 'https://cdn.kinconecta.test/tours/t3.jpg', 'cover-colonial', 4.90, 1, '2026-02-03 08:00:00'),
(4, 4, 4, 'Murales y Barrios de Oaxaca', 'Recorrido de arte urbano y cultura local.', 700.00, 'MXN', 4.0, 10, 'Jardin Conzatti', 'active', 'https://cdn.kinconecta.test/tours/t4.jpg', 'cover-urban', 4.60, 1, '2026-02-04 11:00:00'),
(5, 5, 5, 'Amanecer en Cenotes', 'Ruta de naturaleza con enfoque en seguridad.', 1100.00, 'MXN', 4.0, 5, 'Plaza Puerto Morelos', 'active', 'https://cdn.kinconecta.test/tours/t5.jpg', 'cover-nature', 4.95, 1, '2026-02-05 06:00:00');

INSERT INTO `tour_included_items` (`item_id`, `tour_id`, `item_text`, `sort_order`) VALUES
(1, 1, 'Guia bilingue y entradas basicas', 1),
(2, 2, 'Degustaciones incluidas en 3 paradas', 1),
(3, 3, 'Mapa historico y guia fotografica', 1),
(4, 4, 'Acceso a galeria local participante', 1),
(5, 5, 'Equipo basico y bebida hidratante', 1);

INSERT INTO `tour_destinations` (`tour_id`, `destination_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

INSERT INTO `trip_bookings` (
  `trip_id`, `tour_id`, `tourist_id`, `guide_id`, `start_datetime`, `end_datetime`,
  `status`, `cancel_reason`, `notes`, `created_at`
) VALUES
(1, 1, 2, 1, '2026-03-10 09:00:00', '2026-03-10 13:00:00', 'completed', NULL, 'Cliente interesado en museos.', '2026-02-25 12:00:00'),
(2, 2, 3, 2, '2026-03-11 10:00:00', '2026-03-11 14:00:00', 'completed', NULL, 'Solicita opciones sin gluten.', '2026-02-25 12:10:00'),
(3, 3, 4, 3, '2026-03-12 08:00:00', '2026-03-12 12:00:00', 'completed', NULL, 'Le interesa enfoque fotografico.', '2026-02-25 12:20:00'),
(4, 4, 5, 4, '2026-03-13 09:00:00', '2026-03-13 13:00:00', 'completed', NULL, 'Grupo pequeno con ritmo alto.', '2026-02-25 12:30:00'),
(5, 5, 1, 5, '2026-03-14 06:00:00', '2026-03-14 10:00:00', 'completed', NULL, 'Priorizar cenotes con baja afluencia.', '2026-02-25 12:40:00');

INSERT INTO `trip_status_history` (
  `history_id`, `trip_id`, `old_status`, `new_status`, `reason`, `changed_by_user_id`, `changed_at`
) VALUES
(1, 1, 'confirmed', 'completed', 'Servicio finalizado sin incidencias.', 1, '2026-03-10 13:10:00'),
(2, 2, 'confirmed', 'completed', 'Tour completado y validado.', 2, '2026-03-11 14:05:00'),
(3, 3, 'confirmed', 'completed', 'Cliente confirmo experiencia positiva.', 3, '2026-03-12 12:10:00'),
(4, 4, 'confirmed', 'completed', 'Recorrido terminado en horario.', 4, '2026-03-13 13:05:00'),
(5, 5, 'confirmed', 'completed', 'Tour cerrado con check-out exitoso.', 5, '2026-03-14 10:15:00');

INSERT INTO `guide_calendar_events` (
  `event_id`, `guide_id`, `trip_id`, `event_type`, `title`, `start_datetime`,
  `end_datetime`, `organizer_name`, `source`, `status`, `created_at`
) VALUES
(1, 1, 1, 'booked', 'Tour Centro Historico', '2026-03-10 09:00:00', '2026-03-10 13:00:00', 'Bruno Diaz', 'trip', 'active', '2026-02-25 12:00:00'),
(2, 2, 2, 'booked', 'Tour Gastronomico', '2026-03-11 10:00:00', '2026-03-11 14:00:00', 'Carla Ruiz', 'trip', 'active', '2026-02-25 12:10:00'),
(3, 3, 3, 'booked', 'Tour Colonial', '2026-03-12 08:00:00', '2026-03-12 12:00:00', 'Diego Mendez', 'trip', 'active', '2026-02-25 12:20:00'),
(4, 4, 4, 'booked', 'Tour de Murales', '2026-03-13 09:00:00', '2026-03-13 13:00:00', 'Elena Flores', 'trip', 'active', '2026-02-25 12:30:00'),
(5, 5, 5, 'booked', 'Tour de Cenotes', '2026-03-14 06:00:00', '2026-03-14 10:00:00', 'Ana Torres', 'trip', 'active', '2026-02-25 12:40:00');

INSERT INTO `favorite_guides` (`tourist_id`, `guide_id`, `created_at`) VALUES
(2, 1, '2026-03-01 09:00:00'),
(3, 2, '2026-03-01 09:05:00'),
(4, 3, '2026-03-01 09:10:00'),
(5, 4, '2026-03-01 09:15:00'),
(1, 5, '2026-03-01 09:20:00');

INSERT INTO `favorite_tours` (`tourist_id`, `tour_id`, `created_at`) VALUES
(2, 1, '2026-03-01 10:00:00'),
(3, 2, '2026-03-01 10:05:00'),
(4, 3, '2026-03-01 10:10:00'),
(5, 4, '2026-03-01 10:15:00'),
(1, 5, '2026-03-01 10:20:00');

INSERT INTO `reviews` (
  `review_id`, `trip_id`, `tour_id`, `guide_id`, `tourist_id`, `rating`,
  `comment`, `likes_count`, `replies_count`, `created_at`, `deleted_at`
) VALUES
(1, 1, 1, 1, 2, 5, 'Excelente narrativa historica y buena organizacion.', 3, 1, '2026-03-15 09:00:00', NULL),
(2, 2, 2, 2, 3, 4, 'Muy buena comida y ritmo agradable.', 2, 1, '2026-03-15 09:20:00', NULL),
(3, 3, 3, 3, 4, 5, 'Gran equilibrio entre historia y fotografia.', 4, 1, '2026-03-15 09:40:00', NULL),
(4, 4, 4, 4, 5, 4, 'Recorrido creativo y bien guiado.', 1, 1, '2026-03-15 10:00:00', NULL),
(5, 5, 5, 5, 1, 5, 'Experiencia segura y paisajes impresionantes.', 5, 1, '2026-03-15 10:20:00', NULL);

INSERT INTO `review_replies` (`reply_id`, `review_id`, `guide_id`, `message`, `created_at`) VALUES
(1, 1, 1, 'Gracias por confiar en mi ruta cultural.', '2026-03-15 11:00:00'),
(2, 2, 2, 'Un gusto compartir la ruta gastronomica contigo.', '2026-03-15 11:05:00'),
(3, 3, 3, 'Gracias por tus comentarios sobre la experiencia.', '2026-03-15 11:10:00'),
(4, 4, 4, 'Seguimos creando rutas de arte para ti.', '2026-03-15 11:15:00'),
(5, 5, 5, 'Gracias por valorar la seguridad en el tour.', '2026-03-15 11:20:00');

INSERT INTO `chat_threads` (`thread_id`, `trip_id`, `tourist_id`, `guide_id`, `last_message_at`, `status`, `created_at`) VALUES
(1, 1, 2, 1, '2026-03-09 18:10:00', 'active', '2026-02-26 08:00:00'),
(2, 2, 3, 2, '2026-03-10 19:15:00', 'active', '2026-02-26 08:05:00'),
(3, 3, 4, 3, '2026-03-11 20:20:00', 'active', '2026-02-26 08:10:00'),
(4, 4, 5, 4, '2026-03-12 21:25:00', 'active', '2026-02-26 08:15:00'),
(5, 5, 1, 5, '2026-03-13 22:30:00', 'active', '2026-02-26 08:20:00');

INSERT INTO `chat_messages` (`message_id`, `thread_id`, `sender_user_id`, `body`, `message_type`, `sent_at`, `read_at`) VALUES
(1, 1, 2, 'Hola, confirmo punto de encuentro en Bellas Artes.', 'text', '2026-03-09 18:10:00', '2026-03-09 18:12:00'),
(2, 2, 3, 'Perfecto, llevo lista la ruta sin gluten.', 'text', '2026-03-10 19:15:00', '2026-03-10 19:18:00'),
(3, 3, 4, 'Podemos iniciar antes para tomar fotos?', 'text', '2026-03-11 20:20:00', NULL),
(4, 4, 5, 'Confirmado, grupo de cinco personas.', 'text', '2026-03-12 21:25:00', NULL),
(5, 5, 1, 'Llevo bloqueador biodegradable como indicaste.', 'text', '2026-03-13 22:30:00', NULL);

INSERT INTO `notifications` (
  `notification_id`, `user_id`, `type`, `title`, `body`,
  `related_entity_type`, `related_entity_id`, `is_read`, `created_at`, `read_at`
) VALUES
(1, 1, 'new_review', 'Nueva resena recibida', 'Tu tour Centro Historico recibio 5 estrellas.', 'review', 1, 1, '2026-03-15 09:05:00', '2026-03-15 09:10:00'),
(2, 2, 'trip_confirmed', 'Viaje confirmado', 'Tu viaje para la ruta gastronomica fue confirmado.', 'trip', 2, 0, '2026-03-10 19:00:00', NULL),
(3, 3, 'new_message', 'Nuevo mensaje en chat', 'Tienes un nuevo mensaje del viajero.', 'thread', 3, 0, '2026-03-11 20:21:00', NULL),
(4, 4, 'payout_update', 'Actualizacion de retiro', 'Se actualizo el estado de tu solicitud de retiro.', 'withdrawal', 4, 1, '2026-03-18 12:00:00', '2026-03-18 12:05:00'),
(5, 5, 'system', 'Recordatorio de perfil', 'Completa tus preferencias para mejorar coincidencias.', 'profile', 5, 0, '2026-03-16 08:00:00', NULL);

INSERT INTO `support_tickets` (
  `ticket_id`, `user_id`, `role_context`, `full_name`, `email`,
  `subject`, `category`, `message`, `status`, `created_at`
) VALUES
(1, 1, 'guide', 'Ana Torres', 'ana.torres.guia@kinconecta.test', 'Duda sobre calendario', 'general', 'Necesito bloquear dos horarios en abril.', 'open', '2026-03-17 09:00:00'),
(2, 2, 'guide', 'Bruno Diaz', 'bruno.diaz.guia@kinconecta.test', 'Factura de servicio', 'pagos_facturacion', 'No veo reflejada una factura del mes.', 'in_progress', '2026-03-17 09:20:00'),
(3, 3, 'guide', 'Carla Ruiz', 'carla.ruiz.guia@kinconecta.test', 'Cambio de reserva', 'reservas_viajes', 'Un viajero solicito cambio de horario.', 'resolved', '2026-03-17 09:40:00'),
(4, 4, 'guide', 'Diego Mendez', 'diego.mendez.guia@kinconecta.test', 'Verificacion de perfil', 'verificacion_guias', 'Subi documentos y quiero validar estado.', 'closed', '2026-03-17 10:00:00'),
(5, 5, 'guide', 'Elena Flores', 'elena.flores.guia@kinconecta.test', 'Seguridad de cuenta', 'cuenta_seguridad', 'Quiero activar medidas adicionales de seguridad.', 'open', '2026-03-17 10:20:00');

INSERT INTO `support_ticket_attachments` (
  `attachment_id`, `ticket_id`, `file_url`, `file_name`, `mime_type`, `file_size_bytes`, `uploaded_at`
) VALUES
(1, 1, 'https://cdn.kinconecta.test/support/t1-itinerario.pdf', 'itinerario-abril.pdf', 'application/pdf', 245120, '2026-03-17 09:05:00'),
(2, 2, 'https://cdn.kinconecta.test/support/t2-factura.jpg', 'factura-marzo.jpg', 'image/jpeg', 182044, '2026-03-17 09:25:00'),
(3, 3, 'https://cdn.kinconecta.test/support/t3-reserva.png', 'reserva-cambio.png', 'image/png', 160321, '2026-03-17 09:45:00'),
(4, 4, 'https://cdn.kinconecta.test/support/t4-id.pdf', 'identificacion.pdf', 'application/pdf', 210874, '2026-03-17 10:05:00'),
(5, 5, 'https://cdn.kinconecta.test/support/t5-seguridad.txt', 'solicitud-seguridad.txt', 'text/plain', 4096, '2026-03-17 10:25:00');

INSERT INTO `faq_categories` (`faq_category_id`, `name`, `role_scope`, `sort_order`) VALUES
(1, 'Reservas', 'guide', 1),
(2, 'Pagos', 'guide', 2),
(3, 'Perfil', 'guide', 3),
(4, 'Experiencias', 'tourist', 4),
(5, 'Cuenta', 'both', 5);

INSERT INTO `faq_items` (`faq_item_id`, `faq_category_id`, `question`, `answer`, `is_active`, `sort_order`) VALUES
(1, 1, 'Como confirmo una reserva?', 'Desde el panel de viajes puedes aceptar y confirmar en un paso.', 1, 1),
(2, 2, 'Cuando se procesa un retiro?', 'Los retiros aprobados se procesan en un plazo de 24 a 72 horas.', 1, 1),
(3, 3, 'Como actualizo mi perfil de guia?', 'Edita tu perfil y guarda cambios en la seccion de informacion publica.', 1, 1),
(4, 4, 'Como dejar una resena?', 'Al finalizar el viaje se habilita automaticamente el formulario de resena.', 1, 1),
(5, 5, 'Como recupero mi cuenta?', 'Usa la opcion de recuperacion por correo en la pantalla de acceso.', 1, 1);

INSERT INTO `withdrawal_requests` (
  `withdrawal_id`, `guide_id`, `requested_amount`, `status`, `bank_reference`,
  `notes`, `requested_at`, `processed_at`, `processed_by_user_id`
) VALUES
(1, 1, 1200.00, 'pending', NULL, 'Primer retiro del mes.', '2026-03-18 08:00:00', NULL, NULL),
(2, 2, 950.00, 'approved', 'TRX-APR-002', 'Aprobado para pago en lote semanal.', '2026-03-18 08:10:00', '2026-03-18 11:00:00', 5),
(3, 3, 1500.00, 'paid', 'TRX-APR-003', 'Pagado por transferencia SPEI.', '2026-03-18 08:20:00', '2026-03-18 12:00:00', 5),
(4, 4, 700.00, 'rejected', NULL, 'Falta validar informacion bancaria.', '2026-03-18 08:30:00', '2026-03-18 12:30:00', 5),
(5, 5, 500.00, 'cancelled', NULL, 'Cancelado por solicitud del guia.', '2026-03-18 08:40:00', NULL, NULL);

INSERT INTO `compatibility_profiles` (
  `compatibility_profile_id`, `user_id`, `role`, `name`, `img_url`, `description`,
  `email`, `date_of_birth`, `phone_country_code`, `phone_number`, `phone_e164`, `created_at`
) VALUES
(1, 1, 'guide', 'Ana Cultural', 'https://cdn.kinconecta.test/compat/u1.jpg', 'Guia enfocada en historia y arte.', 'ana.torres.guia@kinconecta.test', '1990-04-12', '+52', '5510000001', '+5215510000001', '2026-02-01 08:00:00'),
(2, 2, 'guide', 'Bruno Foodie', 'https://cdn.kinconecta.test/compat/u2.jpg', 'Guia centrado en experiencias gastronomicas.', 'bruno.diaz.guia@kinconecta.test', '1988-09-03', '+52', '5510000002', '+5215510000002', '2026-02-01 08:10:00'),
(3, 3, 'traveler', 'Carla Explorer', 'https://cdn.kinconecta.test/compat/u3.jpg', 'Viajera que prefiere arquitectura y caminatas.', 'carla.ruiz.guia@kinconecta.test', '1992-01-22', '+52', '5510000003', '+5215510000003', '2026-02-01 08:20:00'),
(4, 4, 'traveler', 'Diego Urban', 'https://cdn.kinconecta.test/compat/u4.jpg', 'Viajero interesado en arte urbano y cultura.', 'diego.mendez.guia@kinconecta.test', '1985-07-15', '+52', '5510000004', '+5215510000004', '2026-02-01 08:30:00'),
(5, 5, 'guide', 'Elena Nature', 'https://cdn.kinconecta.test/compat/u5.jpg', 'Guia de actividades al aire libre.', 'elena.flores.guia@kinconecta.test', '1994-11-30', '+52', '5510000005', '+5215510000005', '2026-02-01 08:40:00');

INSERT INTO `compatibility_answers` (
  `answer_id`, `compatibility_profile_id`, `question_key`, `value_text`, `value_number`, `value_json`, `created_at`
) VALUES
(1, 1, 'travel_style', 'Cultural y pausado', NULL, NULL, '2026-02-01 09:00:00'),
(2, 2, 'group_size_pref', 'Prefiere grupos pequenos', 6.00, NULL, '2026-02-01 09:05:00'),
(3, 3, 'food_interest', 'Interes alto en comida local', 9.00, NULL, '2026-02-01 09:10:00'),
(4, 4, 'activity_level', 'Moderado', 7.00, NULL, '2026-02-01 09:15:00'),
(5, 5, 'photo_focus', 'Paisaje natural', 8.00, NULL, '2026-02-01 09:20:00');

INSERT INTO `contact_messages` (`contact_message_id`, `name`, `email`, `subject`, `message`, `source_page`, `status`, `created_at`) VALUES
(1, 'Laura Gomez', 'laura.gomez@mail.test', 'Informacion de tours', 'Quiero conocer opciones para fin de semana.', 'home', 'new', '2026-03-01 12:00:00'),
(2, 'Miguel Perez', 'miguel.perez@mail.test', 'Alianzas', 'Me interesa colaborar con su plataforma.', 'about', 'read', '2026-03-01 12:10:00'),
(3, 'Sofia Navarro', 'sofia.navarro@mail.test', 'Soporte web', 'No puedo enviar formulario desde movil.', 'contact', 'new', '2026-03-01 12:20:00'),
(4, 'Ramon Ortega', 'ramon.ortega@mail.test', 'Cobertura ciudades', 'Planean abrir tours en Puebla?', 'home', 'archived', '2026-03-01 12:30:00'),
(5, 'Julia Rios', 'julia.rios@mail.test', 'Recomendacion', 'Excelente sitio, sugiero agregar filtro por accesibilidad.', 'contact', 'read', '2026-03-01 12:40:00');

INSERT INTO `income_transactions` (
  `transaction_id`, `guide_id`, `trip_id`, `tour_id`, `txn_type`, `amount`,
  `sign`, `status`, `description`, `occurred_at`, `created_at`
) VALUES
(1, 1, 1, 1, 'booking_income', 850.00, 'credit', 'completed', 'Ingreso por tour Centro Historico.', '2026-03-10 13:20:00', '2026-03-10 13:20:00'),
(2, 2, 2, 2, 'booking_income', 780.00, 'credit', 'completed', 'Ingreso por tour gastronomico.', '2026-03-11 14:20:00', '2026-03-11 14:20:00'),
(3, 3, 3, 3, 'booking_income', 920.00, 'credit', 'completed', 'Ingreso por tour colonial.', '2026-03-12 12:20:00', '2026-03-12 12:20:00'),
(4, 4, NULL, NULL, 'withdrawal', 700.00, 'debit', 'completed', 'Debito por retiro rechazado y revertido en flujo interno.', '2026-03-18 12:35:00', '2026-03-18 12:35:00'),
(5, 5, 5, 5, 'booking_income', 1100.00, 'credit', 'pending', 'Ingreso pendiente por tour de cenotes.', '2026-03-14 10:30:00', '2026-03-14 10:30:00');

INSERT INTO `newsletter_subscriptions` (`subscription_id`, `email`, `source_page`, `is_active`, `created_at`, `unsubscribed_at`) VALUES
(1, 'boletin1@mail.test', 'home', 1, '2026-02-01 10:00:00', NULL),
(2, 'boletin2@mail.test', 'blog', 1, '2026-02-01 10:05:00', NULL),
(3, 'boletin3@mail.test', 'contact', 0, '2026-02-01 10:10:00', '2026-02-20 09:00:00'),
(4, 'boletin4@mail.test', 'home', 1, '2026-02-01 10:15:00', NULL),
(5, 'boletin5@mail.test', 'about', 1, '2026-02-01 10:20:00', NULL);

COMMIT;
