-- Adminer 4.8.1 MySQL 8.2.0 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `adherent`;
CREATE TABLE `adherent` (
  `id_adherent` int NOT NULL AUTO_INCREMENT,
  `pseudo` varchar(33) NOT NULL,
  `isAdmin` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id_adherent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `adherent` (`id_adherent`, `pseudo`, `isAdmin`) VALUES
(1,	'babar',	CONV('0', 2, 10) + 0),
(2,	'hackerman',	CONV('0', 2, 10) + 0),
(3,	'ouistiti',	CONV('0', 2, 10) + 0),
(4,	'admybad',	CONV('1', 2, 10) + 0);

DROP TABLE IF EXISTS `field`;
CREATE TABLE `field` (
  `id_field` int NOT NULL AUTO_INCREMENT,
  `field_name` varchar(10) NOT NULL,
  `is_flooded` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id_field`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `field` (`id_field`, `field_name`, `is_flooded`) VALUES
(1,	'Terrain A',	CONV('0', 2, 10) + 0),
(2,	'Terrain B',	CONV('1', 2, 10) + 0),
(3,	'Terrain C',	CONV('0', 2, 10) + 0),
(4,	'Terrain D',	CONV('0', 2, 10) + 0);

DROP TABLE IF EXISTS `reservation`;
CREATE TABLE `reservation` (
  `id_reservation` int NOT NULL AUTO_INCREMENT,
  `id_field` int NOT NULL,
  `id_adherent` int NOT NULL,
  `begin_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  PRIMARY KEY (`id_reservation`),
  KEY `id_field` (`id_field`),
  KEY `id_adherent` (`id_adherent`),
  CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`id_field`) REFERENCES `field` (`id_field`),
  CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`id_adherent`) REFERENCES `adherent` (`id_adherent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `reservation` (`id_reservation`, `id_field`, `id_adherent`, `begin_date`, `end_date`) VALUES
(1,	2,	1,	'2023-12-29 10:00:00',	'2023-12-29 10:45:00'),
(4,	4,	3,	'2023-12-30 10:00:00',	'2023-12-30 10:45:00'),
(11,	2,	1,	'2023-12-30 16:45:00',	'2023-12-30 17:30:00'),
(12,	2,	1,	'2023-12-30 10:00:00',	'2023-12-30 10:45:00'),
(13,	2,	3,	'2023-12-30 13:00:00',	'2023-12-30 13:45:00');

-- 2023-12-29 21:23:56
