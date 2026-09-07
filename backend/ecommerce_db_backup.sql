-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: ecommerce_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add category',7,'add_category'),(26,'Can change category',7,'change_category'),(27,'Can delete category',7,'delete_category'),(28,'Can view category',7,'view_category'),(29,'Can add product',8,'add_product'),(30,'Can change product',8,'change_product'),(31,'Can delete product',8,'delete_product'),(32,'Can view product',8,'view_product'),(33,'Can add Token',9,'add_token'),(34,'Can change Token',9,'change_token'),(35,'Can delete Token',9,'delete_token'),(36,'Can view Token',9,'view_token'),(37,'Can add Token',10,'add_tokenproxy'),(38,'Can change Token',10,'change_tokenproxy'),(39,'Can delete Token',10,'delete_tokenproxy'),(40,'Can view Token',10,'view_tokenproxy'),(41,'Can add location discount',11,'add_locationdiscount'),(42,'Can change location discount',11,'change_locationdiscount'),(43,'Can delete location discount',11,'delete_locationdiscount'),(44,'Can view location discount',11,'view_locationdiscount'),(45,'Can add address',12,'add_address'),(46,'Can change address',12,'change_address'),(47,'Can delete address',12,'delete_address'),(48,'Can view address',12,'view_address'),(49,'Can add cart',13,'add_cart'),(50,'Can change cart',13,'change_cart'),(51,'Can delete cart',13,'delete_cart'),(52,'Can view cart',13,'view_cart'),(53,'Can add order',14,'add_order'),(54,'Can change order',14,'change_order'),(55,'Can delete order',14,'delete_order'),(56,'Can view order',14,'view_order'),(57,'Can add order item',15,'add_orderitem'),(58,'Can change order item',15,'change_orderitem'),(59,'Can delete order item',15,'delete_orderitem'),(60,'Can view order item',15,'view_orderitem'),(61,'Can add product image',16,'add_productimage'),(62,'Can change product image',16,'change_productimage'),(63,'Can delete product image',16,'delete_productimage'),(64,'Can view product image',16,'view_productimage'),(65,'Can add cart item',17,'add_cartitem'),(66,'Can change cart item',17,'change_cartitem'),(67,'Can delete cart item',17,'delete_cartitem'),(68,'Can view cart item',17,'view_cartitem'),(69,'Can add review',18,'add_review'),(70,'Can change review',18,'change_review'),(71,'Can delete review',18,'delete_review'),(72,'Can view review',18,'view_review'),(73,'Can add wishlist item',19,'add_wishlistitem'),(74,'Can change wishlist item',19,'change_wishlistitem'),(75,'Can delete wishlist item',19,'delete_wishlistitem'),(76,'Can view wishlist item',19,'view_wishlistitem'),(77,'Can add delivery service area',20,'add_deliveryservicearea'),(78,'Can change delivery service area',20,'change_deliveryservicearea'),(79,'Can delete delivery service area',20,'delete_deliveryservicearea'),(80,'Can view delivery service area',20,'view_deliveryservicearea'),(81,'Can add pincode location',21,'add_pincodelocation'),(82,'Can change pincode location',21,'change_pincodelocation'),(83,'Can delete pincode location',21,'delete_pincodelocation'),(84,'Can view pincode location',21,'view_pincodelocation'),(85,'Can add customization request',22,'add_customizationrequest'),(86,'Can change customization request',22,'change_customizationrequest'),(87,'Can delete customization request',22,'delete_customizationrequest'),(88,'Can view customization request',22,'view_customizationrequest'),(89,'Can add coupon',23,'add_coupon'),(90,'Can change coupon',23,'change_coupon'),(91,'Can delete coupon',23,'delete_coupon'),(92,'Can view coupon',23,'view_coupon'),(93,'Can add coupon usage',24,'add_couponusage'),(94,'Can change coupon usage',24,'change_couponusage'),(95,'Can delete coupon usage',24,'delete_couponusage'),(96,'Can view coupon usage',24,'view_couponusage'),(97,'Can add wishlist collection',25,'add_wishlistcollection'),(98,'Can change wishlist collection',25,'change_wishlistcollection'),(99,'Can delete wishlist collection',25,'delete_wishlistcollection'),(100,'Can view wishlist collection',25,'view_wishlistcollection'),(101,'Can add wishlist collection item',26,'add_wishlistcollectionitem'),(102,'Can change wishlist collection item',26,'change_wishlistcollectionitem'),(103,'Can delete wishlist collection item',26,'delete_wishlistcollectionitem'),(104,'Can view wishlist collection item',26,'view_wishlistcollectionitem'),(105,'Can add support ticket',27,'add_supportticket'),(106,'Can change support ticket',27,'change_supportticket'),(107,'Can delete support ticket',27,'delete_supportticket'),(108,'Can view support ticket',27,'view_supportticket'),(109,'Can add support message',28,'add_supportmessage'),(110,'Can change support message',28,'change_supportmessage'),(111,'Can delete support message',28,'delete_supportmessage'),(112,'Can view support message',28,'view_supportmessage');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$1000000$iIgEpP4W6swlgO2h6DExqJ$+C7w2/k02LgtsREigBR4I20Kx1w+7jEmT2UmCFr3Dtw=','2026-08-24 16:29:35.304142',1,'admin','','','frdsabrin@gmail.com',1,1,'2026-08-24 16:28:55.773618'),(2,'pbkdf2_sha256$1000000$RAGO1zAi51VWHdOErk9nOF$FoDm9OXnIMG0N+PRiypUSD7Ikeh4sU8VzYbqr3UhhTA=',NULL,1,'Farida','','','frdsabrin@gmail.com',1,1,'2026-08-25 07:08:38.061068'),(3,'pbkdf2_sha256$1000000$B3FGSvBe98dafhixJfaDrS$D1zsjxb3C5XE/IVHdCe0FnyikWbnn+PAZyui/uEKjJA=',NULL,0,'frdsabrin11@gmail.com','Farida','Sabrin','frdsabrin11@gmail.com',0,1,'2026-08-26 04:26:53.170682');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authtoken_token`
--

DROP TABLE IF EXISTS `authtoken_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
INSERT INTO `authtoken_token` VALUES ('90503912b5dc237f9c92e6485748bd58b5fc8ce5','2026-08-26 04:26:53.515956',3);
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2026-08-25 07:10:32.998790','1','Necklace',1,'[{\"added\": {}}]',8,1),(2,'2026-08-25 07:17:41.033823','2','earings',1,'[{\"added\": {}}]',8,1),(3,'2026-08-25 07:20:08.006401','3','Diamond Ring',1,'[{\"added\": {}}]',8,1),(4,'2026-08-25 08:26:12.739885','4','Ring',1,'[{\"added\": {}}]',8,1),(5,'2026-08-27 05:01:35.135390','5','Anklet',1,'[{\"added\": {}}, {\"added\": {\"name\": \"product image\", \"object\": \"ProductImage object (1)\"}}]',8,1),(6,'2026-08-27 05:30:15.687196','2','earings',2,'[{\"changed\": {\"fields\": [\"Stock\"]}}]',8,1),(7,'2026-08-27 09:11:14.146608','1','Diamond',1,'[{\"added\": {}}]',7,1),(8,'2026-08-27 10:44:27.070800','2','Gold',1,'[{\"added\": {}}]',7,1),(9,'2026-08-27 10:46:51.024413','3','Silver',1,'[{\"added\": {}}]',7,1),(10,'2026-08-27 11:14:13.540076','3','Silver',3,'',7,1),(11,'2026-08-31 06:38:06.150309','1','Design Your Own Jewelry — Farida Sabrin',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',22,1),(12,'2026-08-31 11:51:48.529185','4','SAVE20 (percentage)',1,'[{\"added\": {}}]',23,1),(13,'2026-09-03 07:43:03.446819','11','Gold Jewellery (frdsabrin11@gmail.com)',2,'[{\"changed\": {\"fields\": [\"Password hash\"]}}]',25,1),(14,'2026-09-03 07:45:30.085784','11','Gold Jewellery (frdsabrin11@gmail.com)',3,'',25,1),(15,'2026-09-07 05:12:58.647388','2','SUP-4BBE4DF4 - testing',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',27,1);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(9,'authtoken','token'),(10,'authtoken','tokenproxy'),(5,'contenttypes','contenttype'),(6,'sessions','session'),(12,'store','address'),(13,'store','cart'),(17,'store','cartitem'),(7,'store','category'),(23,'store','coupon'),(24,'store','couponusage'),(22,'store','customizationrequest'),(20,'store','deliveryservicearea'),(11,'store','locationdiscount'),(14,'store','order'),(15,'store','orderitem'),(21,'store','pincodelocation'),(8,'store','product'),(16,'store','productimage'),(18,'store','review'),(28,'store','supportmessage'),(27,'store','supportticket'),(25,'store','wishlistcollection'),(26,'store','wishlistcollectionitem'),(19,'store','wishlistitem');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-08-24 11:01:50.351212'),(2,'auth','0001_initial','2026-08-24 11:01:50.919098'),(3,'admin','0001_initial','2026-08-24 11:01:51.039412'),(4,'admin','0002_logentry_remove_auto_add','2026-08-24 11:01:51.047010'),(5,'admin','0003_logentry_add_action_flag_choices','2026-08-24 11:01:51.054530'),(6,'contenttypes','0002_remove_content_type_name','2026-08-24 11:01:51.167782'),(7,'auth','0002_alter_permission_name_max_length','2026-08-24 11:01:51.234623'),(8,'auth','0003_alter_user_email_max_length','2026-08-24 11:01:51.261972'),(9,'auth','0004_alter_user_username_opts','2026-08-24 11:01:51.269857'),(10,'auth','0005_alter_user_last_login_null','2026-08-24 11:01:51.320870'),(11,'auth','0006_require_contenttypes_0002','2026-08-24 11:01:51.323468'),(12,'auth','0007_alter_validators_add_error_messages','2026-08-24 11:01:51.331316'),(13,'auth','0008_alter_user_username_max_length','2026-08-24 11:01:51.385486'),(14,'auth','0009_alter_user_last_name_max_length','2026-08-24 11:01:51.443478'),(15,'auth','0010_alter_group_name_max_length','2026-08-24 11:01:51.463082'),(16,'auth','0011_update_proxy_permissions','2026-08-24 11:01:51.472599'),(17,'auth','0012_alter_user_first_name_max_length','2026-08-24 11:01:51.529912'),(18,'sessions','0001_initial','2026-08-24 11:01:51.564134'),(19,'store','0001_initial','2026-08-24 11:12:05.912631'),(20,'store','0002_alter_product_category_and_more','2026-08-25 07:06:59.966245'),(21,'authtoken','0001_initial','2026-08-25 10:02:21.885978'),(22,'authtoken','0002_auto_20160226_1747','2026-08-25 10:02:21.907151'),(23,'authtoken','0003_tokenproxy','2026-08-25 10:02:21.911315'),(24,'authtoken','0004_alter_tokenproxy_options','2026-08-25 10:02:21.917983'),(25,'store','0003_category_locationdiscount_product_gender_and_more','2026-08-25 10:02:23.351554'),(26,'store','0004_deliveryservicearea_pincodelocation_and_more','2026-08-31 05:30:52.654712'),(27,'store','0005_remove_pincodelocation_is_serviceable_and_more','2026-08-31 05:30:52.925499'),(28,'store','0006_coupon_alter_customizationrequest_options_and_more','2026-08-31 10:58:46.422459'),(29,'store','0007_wishlistcollection_wishlistcollectionitem_and_more','2026-09-02 10:07:04.800926'),(30,'store','0008_wishlistcollection_password_hash','2026-09-03 06:39:54.188369'),(31,'store','0009_supportticket_supportmessage','2026-09-06 19:19:08.309924');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('jgwgdyx8ytir98mtf2wb74qvrqyr1nrz','.eJxVjDkOwjAQAP-yNbJ8Yjslfd4QrddrHEC2lKNC_B1FSgHtzGjeMOG-1WlfeZnmDAMouPyyhPTkdoj8wHbvgnrbljmJIxGnXcXYM79uZ_s3qLhWGIBM8ExkI_lA1jnPTqOlkJWWnL2JTvE1ctRFFuMwaEkFo0YyCQNaCZ8v5Tg4CA:1wyXYF:Q3oiWxdLh8WdfeObOQneG_d57Uxrn-NMGdNhZEzykWQ','2026-09-07 16:29:35.331724');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_address`
--

DROP TABLE IF EXISTS `store_address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_address` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `line1` varchar(255) NOT NULL,
  `line2` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `store_address_user_id_34317815_fk_auth_user_id` (`user_id`),
  CONSTRAINT `store_address_user_id_34317815_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_address`
--

LOCK TABLES `store_address` WRITE;
/*!40000 ALTER TABLE `store_address` DISABLE KEYS */;
INSERT INTO `store_address` VALUES (1,'Farida Sabrin','frdsabrin@gmail.com','07493836992','sakunat khurd','','Bihar sharif','Bihar','803101','India','2026-08-26 06:14:05.980144',3),(2,'Farida Sabrin','frdsabrin@gmail.com','07493836992','sakunat khurd','','Bihar sharif','Bihar','803101','India','2026-08-28 07:53:27.458761',3),(3,'Farida Sabrin','frdsabrin@gmail.com','07493836992','sakunat khurd','','Bihar sharif','Bihar','803101','India','2026-08-31 11:36:52.702244',3);
/*!40000 ALTER TABLE `store_address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_cart`
--

DROP TABLE IF EXISTS `store_cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_cart` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `store_cart_user_id_99e99107_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_cart`
--

LOCK TABLES `store_cart` WRITE;
/*!40000 ALTER TABLE `store_cart` DISABLE KEYS */;
INSERT INTO `store_cart` VALUES (1,'2026-08-26 04:26:53.567802',3);
/*!40000 ALTER TABLE `store_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_cartitem`
--

DROP TABLE IF EXISTS `store_cartitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_cartitem` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int unsigned NOT NULL,
  `cart_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cart_product` (`cart_id`,`product_id`),
  KEY `store_cartitem_product_id_4238d443_fk_store_product_id` (`product_id`),
  CONSTRAINT `store_cartitem_cart_id_4f60ac05_fk_store_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `store_cart` (`id`),
  CONSTRAINT `store_cartitem_product_id_4238d443_fk_store_product_id` FOREIGN KEY (`product_id`) REFERENCES `store_product` (`id`),
  CONSTRAINT `store_cartitem_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_cartitem`
--

LOCK TABLES `store_cartitem` WRITE;
/*!40000 ALTER TABLE `store_cartitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `store_cartitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_category`
--

DROP TABLE IF EXISTS `store_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `kind` varchar(20) NOT NULL,
  `image` varchar(200) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_category`
--

LOCK TABLES `store_category` WRITE;
/*!40000 ALTER TABLE `store_category` DISABLE KEYS */;
INSERT INTO `store_category` VALUES (1,'Diamond','diamond','metal','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRESozexqSZ70tqpK8e8nlWwUyZzVdE31N41BNL3El4Qw&s=10',1),(2,'Gold','gold','metal','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEDNs-qdM9DZlfnvKxMBilpnnOU3RQxdTxLnkDunMZvNAbnYYlD2URmO4&s=10',1);
/*!40000 ALTER TABLE `store_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_coupon`
--

DROP TABLE IF EXISTS `store_coupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_coupon` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_order_amount` decimal(10,2) NOT NULL,
  `maximum_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int unsigned DEFAULT NULL,
  `used_count` int unsigned NOT NULL,
  `per_user_limit` int unsigned NOT NULL,
  `valid_from` datetime(6) NOT NULL,
  `valid_until` datetime(6) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `first_order_only` tinyint(1) NOT NULL,
  `applicable_country` varchar(100) NOT NULL,
  `applicable_state` varchar(100) NOT NULL,
  `applicable_city` varchar(100) NOT NULL,
  `applicable_pincode` varchar(10) NOT NULL,
  `minimum_delivery_radius_km` decimal(7,2) DEFAULT NULL,
  `maximum_delivery_radius_km` decimal(7,2) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  CONSTRAINT `store_coupon_chk_1` CHECK ((`usage_limit` >= 0)),
  CONSTRAINT `store_coupon_chk_2` CHECK ((`used_count` >= 0)),
  CONSTRAINT `store_coupon_chk_3` CHECK ((`per_user_limit` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_coupon`
--

LOCK TABLES `store_coupon` WRITE;
/*!40000 ALTER TABLE `store_coupon` DISABLE KEYS */;
INSERT INTO `store_coupon` VALUES (1,'WELCOME10','10% off on your order','percentage',10.00,2000.00,1000.00,NULL,1,1,'2026-08-31 11:30:28.288875','2027-08-31 11:30:28.288875',1,0,'India','','','',NULL,NULL,'2026-08-31 11:30:28.300668','2026-08-31 11:30:28.300668'),(2,'FLAT500','Flat ₹500 off','fixed',500.00,5000.00,NULL,NULL,0,1,'2026-08-31 11:30:28.322726','2027-08-31 11:30:28.322726',1,0,'India','','','',NULL,NULL,'2026-08-31 11:30:28.323728','2026-08-31 11:30:28.323728'),(3,'DIWALI20','20% off Diwali Special','percentage',20.00,10000.00,5000.00,NULL,0,1,'2026-08-31 11:30:28.332482','2026-11-29 11:30:28.332482',1,0,'India','','','',NULL,NULL,'2026-08-31 11:30:28.332482','2026-08-31 11:30:28.332482'),(4,'SAVE20','20% off on premium orders','percentage',20.00,1000.00,5000.00,NULL,0,1,'2026-08-31 11:51:21.000000','2026-09-30 12:30:00.000000',1,0,'','','','',NULL,NULL,'2026-08-31 11:51:48.529185','2026-08-31 11:51:48.529185');
/*!40000 ALTER TABLE `store_coupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_couponusage`
--

DROP TABLE IF EXISTS `store_couponusage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_couponusage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `coupon_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `used_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_coupon_user_order` (`coupon_id`,`user_id`,`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_couponusage`
--

LOCK TABLES `store_couponusage` WRITE;
/*!40000 ALTER TABLE `store_couponusage` DISABLE KEYS */;
INSERT INTO `store_couponusage` VALUES (1,1,3,3,'2026-08-31 11:36:53');
/*!40000 ALTER TABLE `store_couponusage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_customizationrequest`
--

DROP TABLE IF EXISTS `store_customizationrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_customizationrequest` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(254) NOT NULL,
  `description` longtext NOT NULL,
  `reference_image` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `user_id` int NOT NULL,
  `budget_max` decimal(10,2) DEFAULT NULL,
  `budget_min` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `store_customizationr_product_id_bcadd3aa_fk_store_pro` (`product_id`),
  KEY `store_customizationrequest_user_id_51977111_fk_auth_user_id` (`user_id`),
  CONSTRAINT `store_customizationr_product_id_bcadd3aa_fk_store_pro` FOREIGN KEY (`product_id`) REFERENCES `store_product` (`id`),
  CONSTRAINT `store_customizationrequest_user_id_51977111_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_customizationrequest`
--

LOCK TABLES `store_customizationrequest` WRITE;
/*!40000 ALTER TABLE `store_customizationrequest` DISABLE KEYS */;
INSERT INTO `store_customizationrequest` VALUES (1,'Farida Sabrin','07493836992','frdsabrin11@gmail.com','Gold metal','customizations/3/ring_1.webp','approved','2026-08-31 06:36:46.373990','2026-08-31 06:38:06.148299',NULL,3,NULL,NULL),(2,'Farida Sabrin','07493836992','frdsabrin11@gmail.com','I want same design','customizations/3/ring_1_zBHIqpI.webp','pending','2026-08-31 08:42:03.625220','2026-08-31 08:42:03.625220',NULL,3,NULL,NULL);
/*!40000 ALTER TABLE `store_customizationrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_deliveryservicearea`
--

DROP TABLE IF EXISTS `store_deliveryservicearea`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_deliveryservicearea` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `center_latitude` decimal(9,6) NOT NULL,
  `center_longitude` decimal(9,6) NOT NULL,
  `radius_km` decimal(6,2) NOT NULL,
  `delivery_days_min` smallint unsigned NOT NULL,
  `delivery_days_max` smallint unsigned NOT NULL,
  `active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `store_deliveryservicearea_chk_1` CHECK ((`delivery_days_min` >= 0)),
  CONSTRAINT `store_deliveryservicearea_chk_2` CHECK ((`delivery_days_max` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_deliveryservicearea`
--

LOCK TABLES `store_deliveryservicearea` WRITE;
/*!40000 ALTER TABLE `store_deliveryservicearea` DISABLE KEYS */;
INSERT INTO `store_deliveryservicearea` VALUES (1,'Bihar Service Area',25.594100,85.137600,200.00,3,7,1,'2026-08-31 11:08:59.983895','2026-08-31 11:08:59.983895'),(2,'Delhi NCR',28.613900,77.209000,50.00,2,4,1,'2026-08-31 11:09:00.023828','2026-08-31 11:09:00.023828'),(3,'All India',22.973400,78.656900,3000.00,5,10,1,'2026-08-31 11:09:00.034376','2026-08-31 11:09:00.034376');
/*!40000 ALTER TABLE `store_deliveryservicearea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_locationdiscount`
--

DROP TABLE IF EXISTS `store_locationdiscount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_locationdiscount` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `country` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `pincode` varchar(20) NOT NULL,
  `discount_percentage` decimal(5,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_locationdiscount`
--

LOCK TABLES `store_locationdiscount` WRITE;
/*!40000 ALTER TABLE `store_locationdiscount` DISABLE KEYS */;
/*!40000 ALTER TABLE `store_locationdiscount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_order`
--

DROP TABLE IF EXISTS `store_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` varchar(32) NOT NULL,
  `status` varchar(30) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) NOT NULL,
  `shipping` decimal(12,2) NOT NULL,
  `tax` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `estimated_delivery_start` date NOT NULL,
  `estimated_delivery_end` date NOT NULL,
  `payment_status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `shipping_address_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `coupon_code` varchar(40) NOT NULL,
  `coupon_discount` decimal(12,2) NOT NULL,
  `delivery_days_max` smallint unsigned NOT NULL,
  `delivery_days_min` smallint unsigned NOT NULL,
  `serviceability_checked` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `store_order_shipping_address_id_9d19a8a7_fk_store_address_id` (`shipping_address_id`),
  KEY `store_order_user_id_ae5f7a5f_fk_auth_user_id` (`user_id`),
  CONSTRAINT `store_order_shipping_address_id_9d19a8a7_fk_store_address_id` FOREIGN KEY (`shipping_address_id`) REFERENCES `store_address` (`id`),
  CONSTRAINT `store_order_user_id_ae5f7a5f_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `store_order_chk_1` CHECK ((`delivery_days_max` >= 0)),
  CONSTRAINT `store_order_chk_2` CHECK ((`delivery_days_min` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_order`
--

LOCK TABLES `store_order` WRITE;
/*!40000 ALTER TABLE `store_order` DISABLE KEYS */;
INSERT INTO `store_order` VALUES (1,'E4ABDC2081FD','placed',120000.00,0.00,0.00,3600.00,123600.00,'2026-08-29','2026-09-01','pending','2026-08-26 06:14:05.996504',1,3,'',0.00,6,3,0),(2,'9F034D4D5C83','placed',999.00,0.00,199.00,35.94,1233.94,'2026-08-31','2026-09-03','pending','2026-08-28 07:53:27.503204',2,3,'',0.00,6,3,0),(3,'3A2834E13B20','placed',105999.00,0.00,0.00,3149.97,108148.97,'2026-09-03','2026-09-07','pending','2026-08-31 11:36:52.718316',3,3,'WELCOME10',1000.00,7,3,1);
/*!40000 ALTER TABLE `store_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_orderitem`
--

DROP TABLE IF EXISTS `store_orderitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_orderitem` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_name` varchar(200) NOT NULL,
  `quantity` int unsigned NOT NULL,
  `price_at_purchase` decimal(12,2) NOT NULL,
  `discount_at_purchase` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `store_orderitem_order_id_acf8722d_fk_store_order_id` (`order_id`),
  KEY `store_orderitem_product_id_f2b098d4_fk_store_product_id` (`product_id`),
  CONSTRAINT `store_orderitem_order_id_acf8722d_fk_store_order_id` FOREIGN KEY (`order_id`) REFERENCES `store_order` (`id`),
  CONSTRAINT `store_orderitem_product_id_f2b098d4_fk_store_product_id` FOREIGN KEY (`product_id`) REFERENCES `store_product` (`id`),
  CONSTRAINT `store_orderitem_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_orderitem`
--

LOCK TABLES `store_orderitem` WRITE;
/*!40000 ALTER TABLE `store_orderitem` DISABLE KEYS */;
INSERT INTO `store_orderitem` VALUES (1,'Ring',2,60000.00,0.00,120000.00,1,4),(2,'Anklet',1,999.00,0.00,999.00,2,5),(3,'Diamond Ring',1,45000.00,0.00,45000.00,3,3),(4,'Ring',1,60000.00,0.00,60000.00,3,4),(5,'Anklet',1,999.00,0.00,999.00,3,5);
/*!40000 ALTER TABLE `store_orderitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_pincodelocation`
--

DROP TABLE IF EXISTS `store_pincodelocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_pincodelocation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `pincode` varchar(20) NOT NULL,
  `city` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `raw_response` json DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `is_serviceable` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pincode` (`pincode`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_pincodelocation`
--

LOCK TABLES `store_pincodelocation` WRITE;
/*!40000 ALTER TABLE `store_pincodelocation` DISABLE KEYS */;
INSERT INTO `store_pincodelocation` VALUES (1,'803101','Nalanda','Nalanda','Bihar','India','{\"Status\": \"Success\", \"Message\": \"Number of pincode(s) found:5\", \"PostOffice\": [{\"Name\": \"Alinagar\", \"Block\": \"Bihar\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Amber\", \"Block\": \"Bihar\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Biharsharif\", \"Block\": \"Biharsharif\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Head Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Nalanda College\", \"Block\": \"Bihar\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Sakunat\", \"Block\": \"Bihar\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}]}',25.135500,85.443400,'2026-09-03 12:42:30.386309',1,'2026-08-31 11:08:19'),(2,'854311','Araria','Araria','Bihar','India','{\"Status\": \"Success\", \"Message\": \"Number of pincode(s) found:17\", \"PostOffice\": [{\"Name\": \"Araria\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Araria Bairgachhi\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Bagdahara\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Balua Deorhi\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Bansbari\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Baturbari\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Bochi\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Chirah\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Dabhara\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Deorea Sonapur\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Dubha\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Gairki\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Gaiyari\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Kakan\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Pategana\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"R.T.Mohan\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Rampur Mohanpur\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}]}',28.613900,77.209000,'2026-08-31 11:11:00.313650',1,'2026-08-31 11:11:00'),(3,'249407','Haridwar','Haridwar','Uttarakhand','India','{\"Status\": \"Success\", \"Message\": \"Number of pincode(s) found:3\", \"PostOffice\": [{\"Name\": \"Arya Nagar (Haridwar)\", \"Block\": \"Hardwar\", \"State\": \"Uttarakhand\", \"Circle\": \"Uttarakhand\", \"Region\": \"Dehradun\", \"Country\": \"India\", \"Pincode\": \"249407\", \"District\": \"Haridwar\", \"Division\": \"Dehradun\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Jwalapur\", \"Block\": \"Hardwar\", \"State\": \"Uttarakhand\", \"Circle\": \"Uttarakhand\", \"Region\": \"Dehradun\", \"Country\": \"India\", \"Pincode\": \"249407\", \"District\": \"Haridwar\", \"Division\": \"Dehradun\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Jwalapur Town\", \"Block\": \"Hardwar\", \"State\": \"Uttarakhand\", \"Circle\": \"Uttarakhand\", \"Region\": \"Dehradun\", \"Country\": \"India\", \"Pincode\": \"249407\", \"District\": \"Haridwar\", \"Division\": \"Dehradun\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}]}',29.945700,78.164200,'2026-08-31 11:53:11.791186',1,'2026-08-31 11:11:06'),(4,'181133','Jammu','Jammu','Jammu & Kashmir','India','{\"Status\": \"Success\", \"Message\": \"Number of pincode(s) found:6\", \"PostOffice\": [{\"Name\": \"Bari Brahmna\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Bari Brahmna I/complex\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Birpur\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Sarore\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Smailpur\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Tarore\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}]}',28.613900,77.209000,'2026-08-31 11:53:32.165390',1,'2026-08-31 11:53:32');
/*!40000 ALTER TABLE `store_pincodelocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_product`
--

DROP TABLE IF EXISTS `store_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int unsigned NOT NULL,
  `image` varchar(200) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category` varchar(100) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `is_best_seller` tinyint(1) NOT NULL,
  `is_featured` tinyint(1) NOT NULL,
  `material` varchar(100) NOT NULL,
  `metal_type` varchar(50) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `purity` varchar(50) NOT NULL,
  `sizes` json NOT NULL DEFAULT (_utf8mb4'[]'),
  `stone_type` varchar(100) NOT NULL,
  `weight` decimal(8,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `store_product_chk_1` CHECK ((`stock` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_product`
--

LOCK TABLES `store_product` WRITE;
/*!40000 ALTER TABLE `store_product` DISABLE KEYS */;
INSERT INTO `store_product` VALUES (1,'Necklace','This is gold necklace',249.91,500,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhUDRegQ3BW9FS34-YSA-OcPh__VISOn1a8lxKDHVHRhFS6zcJ09EaTUM&s=10',1,'2026-08-25 07:10:32.997520','2026-08-25 07:10:32.997546','Gold','',0,0,'','',NULL,'','[]','',NULL),(2,'earings','Gold earing',250000.00,5,'https://www.ajio.com/joyalukkas-women-yellow-gold-drop-earrings/p/6006859110_multi',1,'2026-08-25 07:17:41.031525','2026-08-27 05:30:15.683680','gold','',0,0,'','',NULL,'','[]','',NULL),(3,'Diamond Ring','Beautiful diamond ring',45000.00,4,'https://example.com/ring.jpg',1,'2026-08-25 07:20:08.005265','2026-08-25 07:20:08.005283','Ring','',0,0,'','',NULL,'','[]','',NULL),(4,'Ring','Gold Ring',60000.00,3,'https://rukminim2.flixcart.com/image/480/640/xif0q/shopsy-earring/8/z/m/tri-cn-er-zainab-resized-original-imahb5wrtuzhzerq.jpeg?q=90',1,'2026-08-25 08:26:12.736550','2026-08-25 08:26:12.736586','Gold','',0,0,'','',NULL,'','[]','',NULL),(5,'Anklet','Elegant handcrafted anklet designed for everyday wear and special occasions.',999.00,23,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAPhARO50nlfvAjMY19dRDQ4CD4ylLnh2bNahObTadRg&s=10',1,'2026-08-27 05:01:35.128444','2026-08-27 05:01:35.128469','Anklets','women',1,1,'Sterling Silver','Silver',1299.00,'925','[8, 9, 10]','None',12.500);
/*!40000 ALTER TABLE `store_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_productimage`
--

DROP TABLE IF EXISTS `store_productimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_productimage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(200) NOT NULL,
  `alt_text` varchar(200) NOT NULL,
  `position` smallint unsigned NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `store_productimage_product_id_e50e4046_fk_store_product_id` (`product_id`),
  CONSTRAINT `store_productimage_product_id_e50e4046_fk_store_product_id` FOREIGN KEY (`product_id`) REFERENCES `store_product` (`id`),
  CONSTRAINT `store_productimage_chk_1` CHECK ((`position` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_productimage`
--

LOCK TABLES `store_productimage` WRITE;
/*!40000 ALTER TABLE `store_productimage` DISABLE KEYS */;
INSERT INTO `store_productimage` VALUES (1,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAPhARO50nlfvAjMY19dRDQ4CD4ylLnh2bNahObTadRg&s=10','Anklet',4,5);
/*!40000 ALTER TABLE `store_productimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_review`
--

DROP TABLE IF EXISTS `store_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_review` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rating` smallint unsigned NOT NULL,
  `title` varchar(150) NOT NULL,
  `comment` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `product_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_review` (`user_id`,`product_id`),
  KEY `store_review_product_id_abc413b2_fk_store_product_id` (`product_id`),
  CONSTRAINT `store_review_product_id_abc413b2_fk_store_product_id` FOREIGN KEY (`product_id`) REFERENCES `store_product` (`id`),
  CONSTRAINT `store_review_user_id_cc54d86d_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `store_review_chk_1` CHECK ((`rating` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_review`
--

LOCK TABLES `store_review` WRITE;
/*!40000 ALTER TABLE `store_review` DISABLE KEYS */;
/*!40000 ALTER TABLE `store_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_supportmessage`
--

DROP TABLE IF EXISTS `store_supportmessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_supportmessage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `message` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `sender_id` int NOT NULL,
  `ticket_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `store_supportmessage_sender_id_5b630bef_fk_auth_user_id` (`sender_id`),
  KEY `store_supportmessage_ticket_id_f21bd169_fk_store_sup` (`ticket_id`),
  CONSTRAINT `store_supportmessage_sender_id_5b630bef_fk_auth_user_id` FOREIGN KEY (`sender_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `store_supportmessage_ticket_id_f21bd169_fk_store_sup` FOREIGN KEY (`ticket_id`) REFERENCES `store_supportticket` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_supportmessage`
--

LOCK TABLES `store_supportmessage` WRITE;
/*!40000 ALTER TABLE `store_supportmessage` DISABLE KEYS */;
INSERT INTO `store_supportmessage` VALUES (1,'efedcbtg','2026-09-06 19:20:06.314762','2026-09-06 19:20:06.314792',3,1),(2,'test','2026-09-07 05:12:29.700663','2026-09-07 05:12:29.700708',3,2),(3,'testung','2026-09-07 05:14:00.307922','2026-09-07 05:14:00.308135',3,3);
/*!40000 ALTER TABLE `store_supportmessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_supportticket`
--

DROP TABLE IF EXISTS `store_supportticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_supportticket` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(20) NOT NULL,
  `category` varchar(30) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `priority` varchar(10) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `resolved_at` datetime(6) DEFAULT NULL,
  `closed_at` datetime(6) DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_id` (`ticket_id`),
  KEY `store_supportticket_order_id_7de0fc4a_fk_store_order_id` (`order_id`),
  KEY `store_supportticket_user_id_1a12bab0_fk_auth_user_id` (`user_id`),
  CONSTRAINT `store_supportticket_order_id_7de0fc4a_fk_store_order_id` FOREIGN KEY (`order_id`) REFERENCES `store_order` (`id`),
  CONSTRAINT `store_supportticket_user_id_1a12bab0_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_supportticket`
--

LOCK TABLES `store_supportticket` WRITE;
/*!40000 ALTER TABLE `store_supportticket` DISABLE KEYS */;
INSERT INTO `store_supportticket` VALUES (1,'SUP-8B53495F','order_issue','teredcfv','medium','open','2026-09-06 19:20:06.293935','2026-09-06 19:20:06.293958',NULL,NULL,3,3),(2,'SUP-4BBE4DF4','payment_issue','testing','high','closed','2026-09-07 05:12:29.674257','2026-09-07 05:12:58.636452',NULL,NULL,1,3),(3,'SUP-C0E5A06F','account_issue','test','medium','open','2026-09-07 05:14:00.277977','2026-09-07 05:14:00.278036',NULL,NULL,3,3);
/*!40000 ALTER TABLE `store_supportticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_wishlistcollection`
--

DROP TABLE IF EXISTS `store_wishlistcollection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_wishlistcollection` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `visibility` varchar(20) NOT NULL,
  `share_token` varchar(64) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  `password_hash` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_collection_name` (`user_id`,`name`),
  UNIQUE KEY `share_token` (`share_token`),
  CONSTRAINT `store_wishlistcollection_user_id_b130062d_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_wishlistcollection`
--

LOCK TABLES `store_wishlistcollection` WRITE;
/*!40000 ALTER TABLE `store_wishlistcollection` DISABLE KEYS */;
INSERT INTO `store_wishlistcollection` VALUES (12,'My Birthday Wishlist','public','vyB4RTLtZcNJUaQ6ltx_stgONsp2qFNbcMGVf8gjHoyvn0OdIpXhT8HfHIqfNl9E','2026-09-03 07:41:21.702948','2026-09-03 07:41:21.702948',3,NULL),(13,'Gold Jewellery','private',NULL,'2026-09-03 07:53:38.016942','2026-09-03 07:53:38.016942',3,'pbkdf2_sha256$1000000$Iol5DzuLLrMx55NnX81zYo$Fnjvs/p6CclxEHhRY4p3ntIHreLsYunvLnV6By6dF2Q='),(14,'Festive Jewellery','private',NULL,'2026-09-03 08:05:50.987653','2026-09-03 08:05:50.987653',3,'pbkdf2_sha256$1000000$KmSEqEbEdEEqL6ciVRXEBQ$gkc8eYpV6MocGG//mZSQyDJ0g4DYJ0I0d8VIe2gJnps=');
/*!40000 ALTER TABLE `store_wishlistcollection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_wishlistcollectionitem`
--

DROP TABLE IF EXISTS `store_wishlistcollectionitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_wishlistcollectionitem` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `added_at` datetime(6) NOT NULL,
  `collection_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_collection_product` (`collection_id`,`product_id`),
  KEY `store_wishlistcollec_product_id_2139320e_fk_store_pro` (`product_id`),
  CONSTRAINT `store_wishlistcollec_collection_id_1d3add79_fk_store_wis` FOREIGN KEY (`collection_id`) REFERENCES `store_wishlistcollection` (`id`),
  CONSTRAINT `store_wishlistcollec_product_id_2139320e_fk_store_pro` FOREIGN KEY (`product_id`) REFERENCES `store_product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_wishlistcollectionitem`
--

LOCK TABLES `store_wishlistcollectionitem` WRITE;
/*!40000 ALTER TABLE `store_wishlistcollectionitem` DISABLE KEYS */;
INSERT INTO `store_wishlistcollectionitem` VALUES (25,'2026-09-03 08:05:51.028445',14,4);
/*!40000 ALTER TABLE `store_wishlistcollectionitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_wishlistitem`
--

DROP TABLE IF EXISTS `store_wishlistitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_wishlistitem` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `product_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist_product` (`user_id`,`product_id`),
  KEY `store_wishlistitem_product_id_fe19664e_fk_store_product_id` (`product_id`),
  CONSTRAINT `store_wishlistitem_product_id_fe19664e_fk_store_product_id` FOREIGN KEY (`product_id`) REFERENCES `store_product` (`id`),
  CONSTRAINT `store_wishlistitem_user_id_452055e1_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_wishlistitem`
--

LOCK TABLES `store_wishlistitem` WRITE;
/*!40000 ALTER TABLE `store_wishlistitem` DISABLE KEYS */;
INSERT INTO `store_wishlistitem` VALUES (51,'2026-09-03 08:05:11.958054',4,3),(52,'2026-09-03 12:34:54.435628',5,3);
/*!40000 ALTER TABLE `store_wishlistitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Fari','frdsabrin@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$pas/1UW0M9dJDCnkcYRR2w$6lmF2CgmClRLaQGGb2o8NrOw1ugPkRktTC4UEKvd+E0','2026-08-24 11:52:18'),(2,'Farida','farida@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$aXIYzbMdtCg8d8vs0lqkOA$BfoCf1VvGWBI7dui4GTJqgn3rvk1axGpE9lO4lunp30','2026-08-24 11:54:20'),(3,'Farida Sabrin','frdsabrin12@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$1ec9pE+/EHGcEacnb4U4jw$7ZlyUOULbt9MHnlfPEA6MuMAZ1VDWoiQTd2ObBUZMXU','2026-08-24 12:01:18'),(4,'Fari','faridasabrin@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$wVEiDwKGJsR4+/p9wBP5LQ$8cvQgQ2hwKpF0dBqtQxcdz+aAXng24bNTTbU+LFI5bk','2026-08-24 12:14:11'),(5,'sabrin','user@example.com','$argon2id$v=19$m=65536,t=3,p=4$MyLuDvgX7SnYHoeQW6T/fQ$G2SGZj3uPU79oHD/9kyhyUGq0VB2jMuFksJM2H81SuI','2026-08-24 12:21:40'),(6,'Farida Sabrin','frdsabrin123@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$9wxT6OKkAKpCn1q1P4TMyg$WZP3jZixabHuAl2WNhDa2RODb10DBBImJz4SJlbv2Tk','2026-08-24 20:21:09'),(7,'Farida ','frdsabrin02@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$Qtt82CuMs2R+qA+0myPHSA$JucYdthBHahA69OhXgFjX6Uf5kXcUls52IPLU0uPvb0','2026-08-24 20:34:39'),(8,'sabrin','sabrin@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$kmWT4dp89zghjK8agqZWLg$o37wbJv9o1ogmLPx69rn6dapev7dVuQK3NsyrgQpg3Y','2026-08-24 21:35:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'ecommerce_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-07 14:12:30
