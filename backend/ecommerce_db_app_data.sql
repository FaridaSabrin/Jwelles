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
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$1000000$iIgEpP4W6swlgO2h6DExqJ$+C7w2/k02LgtsREigBR4I20Kx1w+7jEmT2UmCFr3Dtw=','2026-08-24 16:29:35.304142',1,'admin','','','frdsabrin@gmail.com',1,1,'2026-08-24 16:28:55.773618'),(2,'pbkdf2_sha256$1000000$RAGO1zAi51VWHdOErk9nOF$FoDm9OXnIMG0N+PRiypUSD7Ikeh4sU8VzYbqr3UhhTA=',NULL,1,'Farida','','','frdsabrin@gmail.com',1,1,'2026-08-25 07:08:38.061068'),(3,'pbkdf2_sha256$1000000$B3FGSvBe98dafhixJfaDrS$D1zsjxb3C5XE/IVHdCe0FnyikWbnn+PAZyui/uEKjJA=',NULL,0,'frdsabrin11@gmail.com','Farida','Sabrin','frdsabrin11@gmail.com',0,1,'2026-08-26 04:26:53.170682');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
INSERT INTO `authtoken_token` VALUES ('90503912b5dc237f9c92e6485748bd58b5fc8ce5','2026-08-26 04:26:53.515956',3);
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_address`
--

LOCK TABLES `store_address` WRITE;
/*!40000 ALTER TABLE `store_address` DISABLE KEYS */;
INSERT INTO `store_address` VALUES (1,'Farida Sabrin','frdsabrin@gmail.com','07493836992','sakunat khurd','','Bihar sharif','Bihar','803101','India','2026-08-26 06:14:05.980144',3),(2,'Farida Sabrin','frdsabrin@gmail.com','07493836992','sakunat khurd','','Bihar sharif','Bihar','803101','India','2026-08-28 07:53:27.458761',3),(3,'Farida Sabrin','frdsabrin@gmail.com','07493836992','sakunat khurd','','Bihar sharif','Bihar','803101','India','2026-08-31 11:36:52.702244',3);
/*!40000 ALTER TABLE `store_address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_cart`
--

LOCK TABLES `store_cart` WRITE;
/*!40000 ALTER TABLE `store_cart` DISABLE KEYS */;
INSERT INTO `store_cart` VALUES (1,'2026-08-26 04:26:53.567802',3);
/*!40000 ALTER TABLE `store_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_cartitem`
--

LOCK TABLES `store_cartitem` WRITE;
/*!40000 ALTER TABLE `store_cartitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `store_cartitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_category`
--

LOCK TABLES `store_category` WRITE;
/*!40000 ALTER TABLE `store_category` DISABLE KEYS */;
INSERT INTO `store_category` VALUES (1,'Diamond','diamond','metal','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRESozexqSZ70tqpK8e8nlWwUyZzVdE31N41BNL3El4Qw&s=10',1),(2,'Gold','gold','metal','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEDNs-qdM9DZlfnvKxMBilpnnOU3RQxdTxLnkDunMZvNAbnYYlD2URmO4&s=10',1);
/*!40000 ALTER TABLE `store_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_coupon`
--

LOCK TABLES `store_coupon` WRITE;
/*!40000 ALTER TABLE `store_coupon` DISABLE KEYS */;
INSERT INTO `store_coupon` VALUES (1,'WELCOME10','10% off on your order','percentage',10.00,2000.00,1000.00,NULL,1,1,'2026-08-31 11:30:28.288875','2027-08-31 11:30:28.288875',1,0,'India','','','',NULL,NULL,'2026-08-31 11:30:28.300668','2026-08-31 11:30:28.300668'),(2,'FLAT500','Flat ₹500 off','fixed',500.00,5000.00,NULL,NULL,0,1,'2026-08-31 11:30:28.322726','2027-08-31 11:30:28.322726',1,0,'India','','','',NULL,NULL,'2026-08-31 11:30:28.323728','2026-08-31 11:30:28.323728'),(3,'DIWALI20','20% off Diwali Special','percentage',20.00,10000.00,5000.00,NULL,0,1,'2026-08-31 11:30:28.332482','2026-11-29 11:30:28.332482',1,0,'India','','','',NULL,NULL,'2026-08-31 11:30:28.332482','2026-08-31 11:30:28.332482'),(4,'SAVE20','20% off on premium orders','percentage',20.00,1000.00,5000.00,NULL,0,1,'2026-08-31 11:51:21.000000','2026-09-30 12:30:00.000000',1,0,'','','','',NULL,NULL,'2026-08-31 11:51:48.529185','2026-08-31 11:51:48.529185');
/*!40000 ALTER TABLE `store_coupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_couponusage`
--

LOCK TABLES `store_couponusage` WRITE;
/*!40000 ALTER TABLE `store_couponusage` DISABLE KEYS */;
INSERT INTO `store_couponusage` VALUES (1,1,3,3,'2026-08-31 11:36:53');
/*!40000 ALTER TABLE `store_couponusage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_customizationrequest`
--

LOCK TABLES `store_customizationrequest` WRITE;
/*!40000 ALTER TABLE `store_customizationrequest` DISABLE KEYS */;
INSERT INTO `store_customizationrequest` VALUES (1,'Farida Sabrin','07493836992','frdsabrin11@gmail.com','Gold metal','customizations/3/ring_1.webp','approved','2026-08-31 06:36:46.373990','2026-08-31 06:38:06.148299',NULL,3,NULL,NULL),(2,'Farida Sabrin','07493836992','frdsabrin11@gmail.com','I want same design','customizations/3/ring_1_zBHIqpI.webp','pending','2026-08-31 08:42:03.625220','2026-08-31 08:42:03.625220',NULL,3,NULL,NULL);
/*!40000 ALTER TABLE `store_customizationrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_deliveryservicearea`
--

LOCK TABLES `store_deliveryservicearea` WRITE;
/*!40000 ALTER TABLE `store_deliveryservicearea` DISABLE KEYS */;
INSERT INTO `store_deliveryservicearea` VALUES (1,'Bihar Service Area',25.594100,85.137600,200.00,3,7,1,'2026-08-31 11:08:59.983895','2026-08-31 11:08:59.983895'),(2,'Delhi NCR',28.613900,77.209000,50.00,2,4,1,'2026-08-31 11:09:00.023828','2026-08-31 11:09:00.023828'),(3,'All India',22.973400,78.656900,3000.00,5,10,1,'2026-08-31 11:09:00.034376','2026-08-31 11:09:00.034376');
/*!40000 ALTER TABLE `store_deliveryservicearea` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_locationdiscount`
--

LOCK TABLES `store_locationdiscount` WRITE;
/*!40000 ALTER TABLE `store_locationdiscount` DISABLE KEYS */;
/*!40000 ALTER TABLE `store_locationdiscount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_order`
--

LOCK TABLES `store_order` WRITE;
/*!40000 ALTER TABLE `store_order` DISABLE KEYS */;
INSERT INTO `store_order` VALUES (1,'E4ABDC2081FD','placed',120000.00,0.00,0.00,3600.00,123600.00,'2026-08-29','2026-09-01','pending','2026-08-26 06:14:05.996504',1,3,'',0.00,6,3,0),(2,'9F034D4D5C83','placed',999.00,0.00,199.00,35.94,1233.94,'2026-08-31','2026-09-03','pending','2026-08-28 07:53:27.503204',2,3,'',0.00,6,3,0),(3,'3A2834E13B20','placed',105999.00,0.00,0.00,3149.97,108148.97,'2026-09-03','2026-09-07','pending','2026-08-31 11:36:52.718316',3,3,'WELCOME10',1000.00,7,3,1);
/*!40000 ALTER TABLE `store_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_orderitem`
--

LOCK TABLES `store_orderitem` WRITE;
/*!40000 ALTER TABLE `store_orderitem` DISABLE KEYS */;
INSERT INTO `store_orderitem` VALUES (1,'Ring',2,60000.00,0.00,120000.00,1,4),(2,'Anklet',1,999.00,0.00,999.00,2,5),(3,'Diamond Ring',1,45000.00,0.00,45000.00,3,3),(4,'Ring',1,60000.00,0.00,60000.00,3,4),(5,'Anklet',1,999.00,0.00,999.00,3,5);
/*!40000 ALTER TABLE `store_orderitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_pincodelocation`
--

LOCK TABLES `store_pincodelocation` WRITE;
/*!40000 ALTER TABLE `store_pincodelocation` DISABLE KEYS */;
INSERT INTO `store_pincodelocation` VALUES (1,'803101','Nalanda','Nalanda','Bihar','India','{\"Status\": \"Success\", \"Message\": \"Number of pincode(s) found:5\", \"PostOffice\": [{\"Name\": \"Alinagar\", \"Block\": \"Bihar\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Amber\", \"Block\": \"Bihar\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Biharsharif\", \"Block\": \"Biharsharif\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Head Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Nalanda College\", \"Block\": \"Bihar\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Sakunat\", \"Block\": \"Bihar\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Patna HQ\", \"Country\": \"India\", \"Pincode\": \"803101\", \"District\": \"Nalanda\", \"Division\": \"Nalanda\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}]}',25.135500,85.443400,'2026-09-03 12:42:30.386309',1,'2026-08-31 11:08:19'),(2,'854311','Araria','Araria','Bihar','India','{\"Status\": \"Success\", \"Message\": \"Number of pincode(s) found:17\", \"PostOffice\": [{\"Name\": \"Araria\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Araria Bairgachhi\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Bagdahara\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Balua Deorhi\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Bansbari\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Baturbari\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Bochi\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Chirah\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Dabhara\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Deorea Sonapur\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Dubha\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Gairki\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Gaiyari\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Kakan\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Pategana\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"R.T.Mohan\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Rampur Mohanpur\", \"Block\": \"Araria\", \"State\": \"Bihar\", \"Circle\": \"Bihar\", \"Region\": \"Muzaffarpur\", \"Country\": \"India\", \"Pincode\": \"854311\", \"District\": \"Araria\", \"Division\": \"Purnea\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}]}',28.613900,77.209000,'2026-08-31 11:11:00.313650',1,'2026-08-31 11:11:00'),(3,'249407','Haridwar','Haridwar','Uttarakhand','India','{\"Status\": \"Success\", \"Message\": \"Number of pincode(s) found:3\", \"PostOffice\": [{\"Name\": \"Arya Nagar (Haridwar)\", \"Block\": \"Hardwar\", \"State\": \"Uttarakhand\", \"Circle\": \"Uttarakhand\", \"Region\": \"Dehradun\", \"Country\": \"India\", \"Pincode\": \"249407\", \"District\": \"Haridwar\", \"Division\": \"Dehradun\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Jwalapur\", \"Block\": \"Hardwar\", \"State\": \"Uttarakhand\", \"Circle\": \"Uttarakhand\", \"Region\": \"Dehradun\", \"Country\": \"India\", \"Pincode\": \"249407\", \"District\": \"Haridwar\", \"Division\": \"Dehradun\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Jwalapur Town\", \"Block\": \"Hardwar\", \"State\": \"Uttarakhand\", \"Circle\": \"Uttarakhand\", \"Region\": \"Dehradun\", \"Country\": \"India\", \"Pincode\": \"249407\", \"District\": \"Haridwar\", \"Division\": \"Dehradun\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}]}',29.945700,78.164200,'2026-08-31 11:53:11.791186',1,'2026-08-31 11:11:06'),(4,'181133','Jammu','Jammu','Jammu & Kashmir','India','{\"Status\": \"Success\", \"Message\": \"Number of pincode(s) found:6\", \"PostOffice\": [{\"Name\": \"Bari Brahmna\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Non-Delivery\"}, {\"Name\": \"Bari Brahmna I/complex\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Sub Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Birpur\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Sarore\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Smailpur\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}, {\"Name\": \"Tarore\", \"Block\": \"Jammu\", \"State\": \"Jammu & Kashmir\", \"Circle\": \"Jammukashmir\", \"Region\": \"Srinagar HQ\", \"Country\": \"India\", \"Pincode\": \"181133\", \"District\": \"Jammu\", \"Division\": \"Jammu\", \"BranchType\": \"Branch Post Office\", \"Description\": null, \"DeliveryStatus\": \"Delivery\"}]}',28.613900,77.209000,'2026-08-31 11:53:32.165390',1,'2026-08-31 11:53:32');
/*!40000 ALTER TABLE `store_pincodelocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_product`
--

LOCK TABLES `store_product` WRITE;
/*!40000 ALTER TABLE `store_product` DISABLE KEYS */;
INSERT INTO `store_product` VALUES (1,'Necklace','This is gold necklace',249.91,500,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhUDRegQ3BW9FS34-YSA-OcPh__VISOn1a8lxKDHVHRhFS6zcJ09EaTUM&s=10',1,'2026-08-25 07:10:32.997520','2026-08-25 07:10:32.997546','Gold','',0,0,'','',NULL,'','[]','',NULL),(2,'earings','Gold earing',250000.00,5,'https://www.ajio.com/joyalukkas-women-yellow-gold-drop-earrings/p/6006859110_multi',1,'2026-08-25 07:17:41.031525','2026-08-27 05:30:15.683680','gold','',0,0,'','',NULL,'','[]','',NULL),(3,'Diamond Ring','Beautiful diamond ring',45000.00,4,'https://example.com/ring.jpg',1,'2026-08-25 07:20:08.005265','2026-08-25 07:20:08.005283','Ring','',0,0,'','',NULL,'','[]','',NULL),(4,'Ring','Gold Ring',60000.00,3,'https://rukminim2.flixcart.com/image/480/640/xif0q/shopsy-earring/8/z/m/tri-cn-er-zainab-resized-original-imahb5wrtuzhzerq.jpeg?q=90',1,'2026-08-25 08:26:12.736550','2026-08-25 08:26:12.736586','Gold','',0,0,'','',NULL,'','[]','',NULL),(5,'Anklet','Elegant handcrafted anklet designed for everyday wear and special occasions.',999.00,23,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAPhARO50nlfvAjMY19dRDQ4CD4ylLnh2bNahObTadRg&s=10',1,'2026-08-27 05:01:35.128444','2026-08-27 05:01:35.128469','Anklets','women',1,1,'Sterling Silver','Silver',1299.00,'925','[8, 9, 10]','None',12.500);
/*!40000 ALTER TABLE `store_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_productimage`
--

LOCK TABLES `store_productimage` WRITE;
/*!40000 ALTER TABLE `store_productimage` DISABLE KEYS */;
INSERT INTO `store_productimage` VALUES (1,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAPhARO50nlfvAjMY19dRDQ4CD4ylLnh2bNahObTadRg&s=10','Anklet',4,5);
/*!40000 ALTER TABLE `store_productimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_review`
--

LOCK TABLES `store_review` WRITE;
/*!40000 ALTER TABLE `store_review` DISABLE KEYS */;
/*!40000 ALTER TABLE `store_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_supportmessage`
--

LOCK TABLES `store_supportmessage` WRITE;
/*!40000 ALTER TABLE `store_supportmessage` DISABLE KEYS */;
INSERT INTO `store_supportmessage` VALUES (1,'efedcbtg','2026-09-06 19:20:06.314762','2026-09-06 19:20:06.314792',3,1),(2,'test','2026-09-07 05:12:29.700663','2026-09-07 05:12:29.700708',3,2),(3,'testung','2026-09-07 05:14:00.307922','2026-09-07 05:14:00.308135',3,3);
/*!40000 ALTER TABLE `store_supportmessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_supportticket`
--

LOCK TABLES `store_supportticket` WRITE;
/*!40000 ALTER TABLE `store_supportticket` DISABLE KEYS */;
INSERT INTO `store_supportticket` VALUES (1,'SUP-8B53495F','order_issue','teredcfv','medium','open','2026-09-06 19:20:06.293935','2026-09-06 19:20:06.293958',NULL,NULL,3,3),(2,'SUP-4BBE4DF4','payment_issue','testing','high','closed','2026-09-07 05:12:29.674257','2026-09-07 05:12:58.636452',NULL,NULL,1,3),(3,'SUP-C0E5A06F','account_issue','test','medium','open','2026-09-07 05:14:00.277977','2026-09-07 05:14:00.278036',NULL,NULL,3,3);
/*!40000 ALTER TABLE `store_supportticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_wishlistcollection`
--

LOCK TABLES `store_wishlistcollection` WRITE;
/*!40000 ALTER TABLE `store_wishlistcollection` DISABLE KEYS */;
INSERT INTO `store_wishlistcollection` VALUES (12,'My Birthday Wishlist','public','vyB4RTLtZcNJUaQ6ltx_stgONsp2qFNbcMGVf8gjHoyvn0OdIpXhT8HfHIqfNl9E','2026-09-03 07:41:21.702948','2026-09-03 07:41:21.702948',3,NULL),(13,'Gold Jewellery','private',NULL,'2026-09-03 07:53:38.016942','2026-09-03 07:53:38.016942',3,'pbkdf2_sha256$1000000$Iol5DzuLLrMx55NnX81zYo$Fnjvs/p6CclxEHhRY4p3ntIHreLsYunvLnV6By6dF2Q='),(14,'Festive Jewellery','private',NULL,'2026-09-03 08:05:50.987653','2026-09-03 08:05:50.987653',3,'pbkdf2_sha256$1000000$KmSEqEbEdEEqL6ciVRXEBQ$gkc8eYpV6MocGG//mZSQyDJ0g4DYJ0I0d8VIe2gJnps=');
/*!40000 ALTER TABLE `store_wishlistcollection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_wishlistcollectionitem`
--

LOCK TABLES `store_wishlistcollectionitem` WRITE;
/*!40000 ALTER TABLE `store_wishlistcollectionitem` DISABLE KEYS */;
INSERT INTO `store_wishlistcollectionitem` VALUES (25,'2026-09-03 08:05:51.028445',14,4);
/*!40000 ALTER TABLE `store_wishlistcollectionitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `store_wishlistitem`
--

LOCK TABLES `store_wishlistitem` WRITE;
/*!40000 ALTER TABLE `store_wishlistitem` DISABLE KEYS */;
INSERT INTO `store_wishlistitem` VALUES (51,'2026-09-03 08:05:11.958054',4,3),(52,'2026-09-03 12:34:54.435628',5,3);
/*!40000 ALTER TABLE `store_wishlistitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Fari','frdsabrin@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$pas/1UW0M9dJDCnkcYRR2w$6lmF2CgmClRLaQGGb2o8NrOw1ugPkRktTC4UEKvd+E0','2026-08-24 11:52:18'),(2,'Farida','farida@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$aXIYzbMdtCg8d8vs0lqkOA$BfoCf1VvGWBI7dui4GTJqgn3rvk1axGpE9lO4lunp30','2026-08-24 11:54:20'),(3,'Farida Sabrin','frdsabrin12@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$1ec9pE+/EHGcEacnb4U4jw$7ZlyUOULbt9MHnlfPEA6MuMAZ1VDWoiQTd2ObBUZMXU','2026-08-24 12:01:18'),(4,'Fari','faridasabrin@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$wVEiDwKGJsR4+/p9wBP5LQ$8cvQgQ2hwKpF0dBqtQxcdz+aAXng24bNTTbU+LFI5bk','2026-08-24 12:14:11'),(5,'sabrin','user@example.com','$argon2id$v=19$m=65536,t=3,p=4$MyLuDvgX7SnYHoeQW6T/fQ$G2SGZj3uPU79oHD/9kyhyUGq0VB2jMuFksJM2H81SuI','2026-08-24 12:21:40'),(6,'Farida Sabrin','frdsabrin123@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$9wxT6OKkAKpCn1q1P4TMyg$WZP3jZixabHuAl2WNhDa2RODb10DBBImJz4SJlbv2Tk','2026-08-24 20:21:09'),(7,'Farida ','frdsabrin02@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$Qtt82CuMs2R+qA+0myPHSA$JucYdthBHahA69OhXgFjX6Uf5kXcUls52IPLU0uPvb0','2026-08-24 20:34:39'),(8,'sabrin','sabrin@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$kmWT4dp89zghjK8agqZWLg$o37wbJv9o1ogmLPx69rn6dapev7dVuQK3NsyrgQpg3Y','2026-08-24 21:35:39');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-07 14:32:28
