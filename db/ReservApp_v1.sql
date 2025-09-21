-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: localhost    Database: reservapp
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comida_tiene_restriccion`
--

DROP TABLE IF EXISTS `comida_tiene_restriccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comida_tiene_restriccion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_comida` int unsigned NOT NULL,
  `id_comida_restriccion` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comida_restriccion` (`id_comida`,`id_comida_restriccion`),
  KEY `idx_ctr_restr` (`id_comida_restriccion`),
  KEY `fk_ctr_created_by` (`created_by`),
  KEY `fk_ctr_updated_by` (`updated_by`),
  CONSTRAINT `fk_ctr_comida` FOREIGN KEY (`id_comida`) REFERENCES `comidas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctr_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ctr_restriccion` FOREIGN KEY (`id_comida_restriccion`) REFERENCES `comidas_restricciones` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ctr_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comida_tiene_restriccion`
--

LOCK TABLES `comida_tiene_restriccion` WRITE;
/*!40000 ALTER TABLE `comida_tiene_restriccion` DISABLE KEYS */;
INSERT INTO `comida_tiene_restriccion` VALUES (1,1004,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(2,1008,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(3,1012,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(4,1016,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(5,1020,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(6,1024,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(7,1028,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(8,1032,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(9,1036,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(10,1040,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(11,1044,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(12,1048,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(13,1052,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(14,1056,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(15,1060,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(16,1064,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(17,1068,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(18,1072,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(19,1076,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(20,1080,2,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(21,1003,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(22,1008,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(23,1010,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(24,1016,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(25,1020,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(26,1024,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(27,1026,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(28,1032,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(29,1036,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(30,1040,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(31,1044,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(32,1046,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(33,1052,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(34,1053,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(35,1058,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(36,1067,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(37,1068,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(38,1072,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(39,1074,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL),(40,1080,1,'2025-09-13 18:35:01','2025-09-13 18:35:01',NULL,NULL);
/*!40000 ALTER TABLE `comida_tiene_restriccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comidas`
--

DROP TABLE IF EXISTS `comidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comidas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_comida_tipo` int unsigned DEFAULT NULL,
  `nombre` varchar(160) COLLATE utf8mb4_general_ci NOT NULL,
  `es_especial` tinyint(1) NOT NULL DEFAULT '0',
  `url_imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_comidas_tipo` (`id_comida_tipo`,`activa`),
  KEY `fk_comidas_created_by` (`created_by`),
  KEY `fk_comidas_updated_by` (`updated_by`),
  CONSTRAINT `fk_comidas_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_comidas_tipo` FOREIGN KEY (`id_comida_tipo`) REFERENCES `comidas_tipos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_comidas_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1091 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comidas`
--

LOCK TABLES `comidas` WRITE;
/*!40000 ALTER TABLE `comidas` DISABLE KEYS */;
INSERT INTO `comidas` VALUES (1001,1,'Budín de queso azul',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1002,2,'Carne estofada con polenta',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1003,3,'Albóndigas de lentejas estofadas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1004,4,'Tortilla de zapallitos a la pizza',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1005,1,'Pastafrola de verduras',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1006,2,'Milanesa de cerdo napolitana con puré de papas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1007,3,'Ñoquis con salsa mixta',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1008,4,'Vegetales con garbanzos al curry',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1009,1,'Soufflé de coles',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1010,2,'Pollo al limón con arroz al azafrán',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1011,3,'Canastitas de choclo fiorentina',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1012,4,'Tarta de hongos, verdeo y queso',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1013,1,'Paquetitos de hongos',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1014,2,'Pastas a las 3 salsas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1015,3,'Rollito de pescado con papas hervidas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1016,4,'Medallón de quinoa y verduras',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1017,1,'Milhojas de papa',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1018,2,'Bife a la criolla con verduras',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1019,3,'Pastel de pollo',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1020,4,'Arroz al champiñón, frutos secos y pasas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1021,1,'Pizza fugazza',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1022,2,'Cerdo con salsa de mostaza y miel con papas cebolladas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1023,3,'Omelette de verdura con tomate y queso',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1024,4,'Polenta con queso azul, cebolla caramelizada, brotes y maní',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1025,1,'Torrejas mixtas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1026,2,'Pollo a la barbacoa con puré amarillo',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1027,3,'Budín de zapallitos',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1028,4,'Tarta de berenjena, verdeo y nueces',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1029,1,'Quiche de verduras',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1030,2,'Hamburguesas con fideos al champiñón',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1031,3,'Soufflé de puerro y queso',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1032,4,'Lentejas guisadas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1033,1,'Budín mediterráneo',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1034,2,'Filet de pollo con chip de batatas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1035,3,'Tarta de cebolla y queso',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1036,4,'Risotto de calabaza',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1037,1,'Bombas de papa',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1038,2,'Lasaña de verduras, jamón, queso y bolognesa',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1039,3,'Pizza napolitana',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1040,4,'Garbanzos cremosos con cebolla caramelizada, espinaca y tomate',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1041,1,'Soufflé de choclo y queso',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1042,2,'Carne al roquefort con puré de batata',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1043,3,'Alubias guisadas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1044,4,'Zapallitos rellenos con quinoa',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1045,1,'Tortilla de papa',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1046,2,'Arroz amarillo con pollo',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1047,3,'Ravioles a la bolognesa',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1048,4,'Pizza integral de cebolla, queso azul y calabaza',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1049,1,'Budín de zanahoria',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1050,2,'Pastel de papa',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1051,3,'Omelette de jamón y queso',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1052,4,'Risotto de espinaca y nueces caramelizadas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1053,1,'Croquetas de arroz',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1054,2,'Milanesa de carne con revuelto de verdura',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1055,3,'Tarta gallega',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1056,4,'Ñoquis capresse',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1057,1,' Pascualina',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1058,2,' Filet de merluza con puré',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1059,3,' Fajitas de pollo',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1060,4,' Curry de lentejas',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1061,1,'Tortilla de zapallitos',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1062,2,'Pastas con salsa con carne cubeteada',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1063,3,'Tarta de queso azul, puerro y nueces',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1064,4,'Coles al bechamel',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1065,1,'Pizza capresse',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1066,2,'Medallón de pollo con papa y calabaza',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1067,3,'Pescado a la fiorentina',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1068,4,'Risotto de zapallo, queso azul y cebolla caramelizada',0,NULL,1,'2025-09-13 18:31:38','2025-09-13 18:31:38',NULL,NULL),(1069,1,'Empanadas de puerro',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1070,2,'Pan de carne con bastones de zanahoria',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1071,3,'Tacos de carne',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1072,4,'Berenjena con tajos de espinaca, queso y nueces',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1073,1,'Bombas de papa',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1074,2,'Guiso de lentejas',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1075,3,'Pizza de hongos',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1076,4,'Canelones de verdura con salsa blanca',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1077,1,' Tarta de jamón y queso',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1078,2,' Suprema con colchón de arvejas y verduras',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1079,3,' Omelette de queso y aceitunas',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1080,4,' Bowl de quinoa y verduras',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1081,5,'Agua mineral',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1082,5,'Gaseosa',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1083,5,'Jugo natural',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1084,5,'Agua saborizada',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1085,5,'Café',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1086,6,'Flan casero',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1087,6,'Ensalada de frutas',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1088,6,'Gelatina',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1089,6,'Yogur',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL),(1090,6,'Helado',0,NULL,1,'2025-09-13 18:31:39','2025-09-13 18:31:39',NULL,NULL);
/*!40000 ALTER TABLE `comidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comidas_planificacion_semanal`
--

DROP TABLE IF EXISTS `comidas_planificacion_semanal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comidas_planificacion_semanal` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_planificacion_semanal` int unsigned NOT NULL,
  `id_comida_entrada` int unsigned DEFAULT NULL,
  `id_comida_principal` int unsigned DEFAULT NULL,
  `id_comida_alternativo` int unsigned DEFAULT NULL,
  `id_comida_vegetariana` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cps_planif` (`id_planificacion_semanal`),
  KEY `fk_cps_entrada` (`id_comida_entrada`),
  KEY `fk_cps_principal` (`id_comida_principal`),
  KEY `fk_cps_alternativo` (`id_comida_alternativo`),
  KEY `fk_cps_vegetariana` (`id_comida_vegetariana`),
  KEY `fk_cps_created_by` (`created_by`),
  KEY `fk_cps_updated_by` (`updated_by`),
  CONSTRAINT `fk_cps_alternativo` FOREIGN KEY (`id_comida_alternativo`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cps_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cps_entrada` FOREIGN KEY (`id_comida_entrada`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cps_planif` FOREIGN KEY (`id_planificacion_semanal`) REFERENCES `planificaciones_semanales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cps_principal` FOREIGN KEY (`id_comida_principal`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cps_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cps_vegetariana` FOREIGN KEY (`id_comida_vegetariana`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comidas_planificacion_semanal`
--

LOCK TABLES `comidas_planificacion_semanal` WRITE;
/*!40000 ALTER TABLE `comidas_planificacion_semanal` DISABLE KEYS */;
/*!40000 ALTER TABLE `comidas_planificacion_semanal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comidas_restricciones`
--

DROP TABLE IF EXISTS `comidas_restricciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comidas_restricciones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comidas_restr_nombre` (`nombre`),
  KEY `fk_cr_created_by` (`created_by`),
  KEY `fk_cr_updated_by` (`updated_by`),
  CONSTRAINT `fk_cr_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cr_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comidas_restricciones`
--

LOCK TABLES `comidas_restricciones` WRITE;
/*!40000 ALTER TABLE `comidas_restricciones` DISABLE KEYS */;
INSERT INTO `comidas_restricciones` VALUES (1,'Sin TACC',NULL,'2025-09-13 17:51:51','2025-09-13 17:51:51',NULL,NULL),(2,'Vegetariano',NULL,'2025-09-13 17:51:51','2025-09-13 17:51:51',NULL,NULL);
/*!40000 ALTER TABLE `comidas_restricciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comidas_tipos`
--

DROP TABLE IF EXISTS `comidas_tipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comidas_tipos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_comidas_tipos_nombre` (`nombre`),
  KEY `fk_ct_created_by` (`created_by`),
  KEY `fk_ct_updated_by` (`updated_by`),
  CONSTRAINT `fk_ct_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ct_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comidas_tipos`
--

LOCK TABLES `comidas_tipos` WRITE;
/*!40000 ALTER TABLE `comidas_tipos` DISABLE KEYS */;
INSERT INTO `comidas_tipos` VALUES (1,'Entradas',NULL,'2025-09-13 17:51:25','2025-09-13 17:51:25',NULL,NULL),(2,'Plato Principal',NULL,'2025-09-13 17:51:25','2025-09-13 17:51:25',NULL,NULL),(3,'Plato Alternativo',NULL,'2025-09-13 17:51:25','2025-09-13 17:51:25',NULL,NULL),(4,'Plato Vegetariano',NULL,'2025-09-13 17:51:25','2025-09-13 17:51:25',NULL,NULL),(5,'Bebidas',NULL,'2025-09-13 17:51:25','2025-09-13 17:51:25',NULL,NULL),(6,'Postres',NULL,'2025-09-13 17:51:25','2025-09-13 17:51:25',NULL,NULL);
/*!40000 ALTER TABLE `comidas_tipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleados` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_persona` int unsigned NOT NULL,
  `turno` enum('manana','tarde','noche') COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` enum('interno','externo') COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_empleados_persona` (`id_persona`),
  KEY `fk_empleados_created_by` (`created_by`),
  KEY `fk_empleados_updated_by` (`updated_by`),
  CONSTRAINT `fk_empleados_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_empleados_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_empleados_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleados`
--

LOCK TABLES `empleados` WRITE;
/*!40000 ALTER TABLE `empleados` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estaciones`
--

DROP TABLE IF EXISTS `estaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estaciones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_estaciones_nombre` (`nombre`),
  KEY `fk_estaciones_created_by` (`created_by`),
  KEY `fk_estaciones_updated_by` (`updated_by`),
  CONSTRAINT `fk_estaciones_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_estaciones_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estaciones`
--

LOCK TABLES `estaciones` WRITE;
/*!40000 ALTER TABLE `estaciones` DISABLE KEYS */;
INSERT INTO `estaciones` VALUES (1,'Verano','2025-09-13 17:52:13','2025-09-13 17:52:13',NULL,NULL),(2,'Invierno','2025-09-13 17:52:13','2025-09-13 17:52:13',NULL,NULL),(3,'Primavera','2025-09-13 17:52:13','2025-09-13 17:52:13',NULL,NULL),(4,'Otoño','2025-09-13 17:52:13','2025-09-13 17:52:13',NULL,NULL);
/*!40000 ALTER TABLE `estaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historicos_precios`
--

DROP TABLE IF EXISTS `historicos_precios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historicos_precios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `precio` decimal(10,2) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_desde` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_hist_prec_created_by` (`created_by`),
  KEY `fk_hist_prec_updated_by` (`updated_by`),
  CONSTRAINT `fk_hist_prec_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_hist_prec_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historicos_precios`
--

LOCK TABLES `historicos_precios` WRITE;
/*!40000 ALTER TABLE `historicos_precios` DISABLE KEYS */;
/*!40000 ALTER TABLE `historicos_precios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `liquidaciones`
--

DROP TABLE IF EXISTS `liquidaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `liquidaciones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `mes` tinyint unsigned NOT NULL,
  `anio` smallint unsigned NOT NULL,
  `monto_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_liq_periodo` (`anio`,`mes`),
  KEY `fk_liq_created_by` (`created_by`),
  KEY `fk_liq_updated_by` (`updated_by`),
  CONSTRAINT `fk_liq_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_liq_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liquidaciones`
--

LOCK TABLES `liquidaciones` WRITE;
/*!40000 ALTER TABLE `liquidaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `liquidaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `endpoint_path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permisos_nombre` (`nombre`),
  KEY `fk_permisos_created_by` (`created_by`),
  KEY `fk_permisos_updated_by` (`updated_by`),
  CONSTRAINT `fk_permisos_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_permisos_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personas`
--

DROP TABLE IF EXISTS `personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_personas_created_by` (`created_by`),
  KEY `fk_personas_updated_by` (`updated_by`),
  CONSTRAINT `fk_personas_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_personas_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personas`
--

LOCK TABLES `personas` WRITE;
/*!40000 ALTER TABLE `personas` DISABLE KEYS */;
/*!40000 ALTER TABLE `personas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planificaciones_semanales`
--

DROP TABLE IF EXISTS `planificaciones_semanales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planificaciones_semanales` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nro_semana` tinyint unsigned NOT NULL,
  `dia_semana` tinyint unsigned NOT NULL,
  `nro_semana_ci` int unsigned DEFAULT NULL,
  `fecha` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_planif_semana` (`nro_semana`,`dia_semana`,`fecha`),
  KEY `fk_ps_created_by` (`created_by`),
  KEY `fk_ps_updated_by` (`updated_by`),
  CONSTRAINT `fk_ps_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ps_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planificaciones_semanales`
--

LOCK TABLES `planificaciones_semanales` WRITE;
/*!40000 ALTER TABLE `planificaciones_semanales` DISABLE KEYS */;
/*!40000 ALTER TABLE `planificaciones_semanales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `fecha_reservada` date NOT NULL,
  `fecha_cancelacion` datetime DEFAULT NULL,
  `id_comida_entrada` int unsigned DEFAULT NULL,
  `id_comida_principal` int unsigned DEFAULT NULL,
  `id_comida_postre` int unsigned DEFAULT NULL,
  `id_comida_bebida` int unsigned DEFAULT NULL,
  `codigo_qr` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado_reserva` enum('confirmada','cancelada','noshow') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'confirmada',
  `estado_liquidacion` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_res_entrada` (`id_comida_entrada`),
  KEY `idx_res_principal` (`id_comida_principal`),
  KEY `idx_res_postre` (`id_comida_postre`),
  KEY `idx_res_bebida` (`id_comida_bebida`),
  KEY `fk_reservas_created_by` (`created_by`),
  KEY `fk_reservas_updated_by` (`updated_by`),
  CONSTRAINT `fk_res_bebida` FOREIGN KEY (`id_comida_bebida`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_res_entrada` FOREIGN KEY (`id_comida_entrada`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_res_postre` FOREIGN KEY (`id_comida_postre`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_res_principal` FOREIGN KEY (`id_comida_principal`) REFERENCES `comidas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reservas_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reservas_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_nombre` (`nombre`),
  KEY `fk_roles_created_by` (`created_by`),
  KEY `fk_roles_updated_by` (`updated_by`),
  CONSTRAINT `fk_roles_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_roles_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Empleado','2025-09-13 17:52:38','2025-09-13 17:52:38',NULL,NULL),(2,'Administrador','2025-09-13 17:52:38','2025-09-13 17:52:38',NULL,NULL),(3,'RRHH','2025-09-13 17:52:38','2025-09-13 17:52:38',NULL,NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_permisos`
--

DROP TABLE IF EXISTS `roles_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles_permisos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_rol` int unsigned NOT NULL,
  `id_permiso` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rol_permiso` (`id_rol`,`id_permiso`),
  KEY `idx_rp_permiso` (`id_permiso`),
  KEY `fk_rp_created_by` (`created_by`),
  KEY `fk_rp_updated_by` (`updated_by`),
  CONSTRAINT `fk_rp_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_permisos`
--

LOCK TABLES `roles_permisos` WRITE;
/*!40000 ALTER TABLE `roles_permisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temporadas`
--

DROP TABLE IF EXISTS `temporadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temporadas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_estacion` int NOT NULL,
  `anio` smallint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_temporadas_periodo` (`anio`,`fecha_inicio`),
  KEY `fk_temp_created_by` (`created_by`),
  KEY `fk_temp_updated_by` (`updated_by`),
  CONSTRAINT `fk_temp_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_temp_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temporadas`
--

LOCK TABLES `temporadas` WRITE;
/*!40000 ALTER TABLE `temporadas` DISABLE KEYS */;
INSERT INTO `temporadas` VALUES (1,1,2025,'2025-01-01','2025-03-31','2025-09-13 18:48:11','2025-09-13 18:48:11',NULL,NULL),(2,2,2025,'2025-04-01','2025-06-30','2025-09-13 18:48:11','2025-09-13 18:48:11',NULL,NULL),(3,3,2025,'2025-07-01','2025-09-30','2025-09-13 18:48:11','2025-09-13 18:48:11',NULL,NULL),(4,4,2025,'2025-10-01','2025-12-31','2025-09-13 18:48:11','2025-09-13 18:48:11',NULL,NULL),(5,1,2026,'2026-01-01','2025-03-31','2025-09-13 18:48:11','2025-09-13 18:48:11',NULL,NULL),(6,2,2026,'2026-04-01','2025-06-30','2025-09-13 18:48:11','2025-09-13 18:48:11',NULL,NULL),(7,3,2026,'2026-07-01','2025-09-30','2025-09-13 18:48:11','2025-09-13 18:48:11',NULL,NULL),(8,4,2026,'2026-10-01','2025-12-31','2025-09-13 18:48:11','2025-09-13 18:48:11',NULL,NULL);
/*!40000 ALTER TABLE `temporadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(190) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_email` (`email`),
  KEY `fk_usuarios_created_by` (`created_by`),
  KEY `fk_usuarios_updated_by` (`updated_by`),
  CONSTRAINT `fk_usuarios_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usuarios_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_roles`
--

DROP TABLE IF EXISTS `usuarios_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int unsigned NOT NULL,
  `id_rol` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuario_rol` (`id_usuario`,`id_rol`),
  KEY `idx_ur_rol` (`id_rol`),
  KEY `fk_ur_created_by` (`created_by`),
  KEY `fk_ur_updated_by` (`updated_by`),
  CONSTRAINT `fk_ur_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ur_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ur_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ur_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_roles`
--

LOCK TABLES `usuarios_roles` WRITE;
/*!40000 ALTER TABLE `usuarios_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-19 20:02:06
