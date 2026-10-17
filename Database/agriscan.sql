-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 13 أكتوبر 2026 الساعة 00:12
-- إصدار الخادم: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `agriscan`
--

-- --------------------------------------------------------

--
-- بنية الجدول `crops`
--

CREATE TABLE `crops` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `crops`
--

INSERT INTO `crops` (`id`, `name`, `description`, `image`, `created_at`) VALUES
(1, 'الطماطم', 'محصول خضري مهم ويحتاج إلى تربة جيدة التصريف وري منتظم.', NULL, '2026-09-04 07:36:52'),
(2, 'البطاطس', 'محصول درني يحتاج إلى تربة جيدة التهوية وتصريف مناسب للمياه.', NULL, '2026-09-04 07:36:52'),
(3, 'الذرة', 'محصول حبوب يحتاج إلى ضوء جيد ومياه وعناصر غذائية مناسبة.', NULL, '2026-09-04 07:36:52'),
(4, 'القمح', 'محصول حبوب أساسي وينمو بشكل جيد في تربة جيدة الصرف.', NULL, '2026-09-04 07:36:52'),
(5, 'الخيار', 'محصول خضري يحتاج إلى رطوبة مناسبة ودرجة حرارة ملائمة للنمو.', NULL, '2026-09-04 07:36:52'),
(6, 'الفلفل', 'محصول خضري يحتاج إلى تربة خصبة وري منتظم.', NULL, '2026-09-04 07:36:52'),
(7, 'الفراولة', 'محصول فاكهة يحتاج إلى تربة جيدة التصريف ورطوبة متوازنة.', NULL, '2026-09-04 07:36:52'),
(8, 'البصل', 'محصول بصلي يحتاج إلى تربة جيدة الصرف وري مناسب.', NULL, '2026-09-04 07:36:52'),
(9, 'الأرز', 'محصول حبوب يحتاج إلى إدارة دقيقة للمياه وظروف زراعة مناسبة.', NULL, '2026-09-04 07:36:52'),
(10, 'العنب', 'محصول فاكهة يحتاج إلى تربة جيدة التصريف وإدارة مناسبة للري.', NULL, '2026-09-04 07:36:52');

-- --------------------------------------------------------

--
-- بنية الجدول `crop_images`
--

CREATE TABLE `crop_images` (
  `id` int(11) NOT NULL,
  `crop_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `view_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `crop_images`
--

INSERT INTO `crop_images` (`id`, `crop_id`, `image_path`, `view_type`) VALUES
(1, 1, '/images/crops/tomato-1.jpg', 'plant'),
(2, 1, '/images/crops/tomato-2.jpg', 'leaf'),
(3, 1, '/images/crops/tomato-3.jpg', 'fruit'),
(4, 2, '/images/crops/potato-1.jpg', 'plant'),
(5, 2, '/images/crops/potato-2.jpg', 'leaf'),
(6, 2, '/images/crops/potato-3.jpg', 'tuber'),
(7, 3, '/images/crops/corn-1.jpg', 'plant'),
(8, 3, '/images/crops/corn-2.jpg', 'leaf'),
(9, 3, '/images/crops/corn-3.jpg', 'fruit'),
(10, 4, '/images/crops/wheat-1.jpg', 'plant'),
(11, 4, '/images/crops/wheat-2.jpg', 'leaf'),
(12, 4, '/images/crops/wheat-3.jpg', 'fruit'),
(13, 5, '/images/crops/cucumber-1.jpg', 'plant'),
(14, 5, '/images/crops/cucumber-2.jpg', 'leaf'),
(15, 5, '/images/crops/cucumber-3.jpg', 'fruit'),
(16, 6, '/images/crops/pepper-1.jpg', 'plant'),
(17, 6, '/images/crops/pepper-2.jpg', 'leaf'),
(18, 6, '/images/crops/pepper-3.jpg', 'fruit'),
(19, 7, '/images/crops/strawberry-1.jpg', 'plant'),
(20, 7, '/images/crops/strawberry-2.jpg', 'leaf'),
(21, 7, '/images/crops/strawberry-3.jpg', 'fruit'),
(22, 8, '/images/crops/onion-1.jpg', 'plant'),
(23, 8, '/images/crops/onion-2.jpg', 'leaf'),
(24, 8, '/images/crops/onion-3.jpg', 'bulb'),
(25, 9, '/images/crops/rice-1.jpg', 'plant'),
(26, 9, '/images/crops/rice-2.jpg', 'leaf'),
(27, 9, '/images/crops/rice-3.jpg', 'fruit'),
(28, 10, '/images/crops/grape-1.jpg', 'plant'),
(29, 10, '/images/crops/grape-2.jpg', 'leaf'),
(30, 10, '/images/crops/grape-3.jpg', 'fruit');

-- --------------------------------------------------------

--
-- بنية الجدول `crop_soil_requirements`
--

CREATE TABLE `crop_soil_requirements` (
  `id` int(11) NOT NULL,
  `crop_id` int(11) NOT NULL,
  `parameter_id` int(11) NOT NULL,
  `min_value` decimal(10,2) DEFAULT NULL,
  `max_value` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `measurement_method` varchar(150) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `crop_soil_requirements`
--

INSERT INTO `crop_soil_requirements` (`id`, `crop_id`, `parameter_id`, `min_value`, `max_value`, `unit`, `measurement_method`, `source`, `notes`, `created_at`) VALUES
(1, 1, 1, 6.20, 6.80, 'pH', 'Prototype pH sensor reading', 'University of Georgia Cooperative Extension', 'النطاق المرجعي للطماطم 6.20–6.80. قراءة الجهاز الحالية في النموذج الأولي محاكاة وليست مكافئة تلقائيًا لقياس مخبري محدد. يجب معايرة حساس pH الحقيقي ومقارنة طريقته بطريقة تحليل مرجعية قبل الاعتماد على النتيجة ميدانيًا.', '2026-09-27 16:45:28'),
(2, 4, 1, 5.50, 7.00, 'pH', 'Soil pH test', 'Oklahoma State University Extension', 'Preferred soil pH range for wheat. Prototype sensor reading requires calibration before production use.', '2026-10-03 08:50:58');

-- --------------------------------------------------------

--
-- بنية الجدول `devices`
--

CREATE TABLE `devices` (
  `id` int(11) NOT NULL,
  `device_code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` enum('AVAILABLE','CONNECTED','OFFLINE') NOT NULL DEFAULT 'AVAILABLE',
  `farm_id` int(11) DEFAULT NULL,
  `connected_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `devices`
--

INSERT INTO `devices` (`id`, `device_code`, `name`, `status`, `farm_id`, `connected_at`, `created_at`) VALUES
(1, 'AG-001', 'AgriScan AG-001', 'CONNECTED', 8, '2026-10-11 15:31:44', '2026-09-22 21:53:51');

-- --------------------------------------------------------

--
-- بنية الجدول `diseases`
--

CREATE TABLE `diseases` (
  `id` int(11) NOT NULL,
  `crop_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `symptoms` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `diseases`
--

INSERT INTO `diseases` (`id`, `crop_id`, `name`, `symptoms`, `image`, `created_at`) VALUES
(1, 1, 'اللفحة المبكرة', 'ظهور بقع بنية دائرية على الأوراق وقد تتحول الأوراق إلى اللون الأصفر وتسقط.', NULL, '2026-09-04 07:47:29'),
(2, 1, 'البياض الدقيقي', 'ظهور طبقة بيضاء تشبه المسحوق على الأوراق والسيقان مع ضعف نمو النبات.', NULL, '2026-09-04 07:47:29'),
(3, 4, 'صدأ القمح', 'ظهور بقع أو بثرات بلون بني أو برتقالي على الأوراق والسيقان.', NULL, '2026-09-04 07:47:29'),
(4, 4, 'البياض الدقيقي في القمح', 'ظهور نمو أبيض على سطح الأوراق وقد يؤدي إلى ضعف النبات.', NULL, '2026-09-04 07:47:29'),
(5, 3, 'صدأ الذرة', 'ظهور بقع وبثرات بنية أو برتقالية على أوراق الذرة.', NULL, '2026-09-04 07:47:29'),
(6, 3, 'تبقع أوراق الذرة', 'ظهور بقع بنية أو رمادية على الأوراق وقد تؤدي إلى جفافها.', NULL, '2026-09-04 07:47:29'),
(7, 2, 'اللفحة المتأخرة', 'ظهور بقع داكنة على الأوراق والسيقان وقد تمتد إلى الدرنات.', NULL, '2026-09-04 07:47:29'),
(8, 2, 'الجرب الشائع', 'ظهور مناطق خشنة أو فلينية على سطح درنات البطاطس.', NULL, '2026-09-04 07:47:29'),
(9, 5, 'البياض الزغبي', 'ظهور بقع صفراء على الأوراق مع نمو زغبي في الجهة السفلية للأوراق.', NULL, '2026-09-04 07:47:29'),
(10, 5, 'البياض الدقيقي في الخيار', 'ظهور مسحوق أبيض على الأوراق والسيقان وقد يسبب ضعف النمو.', NULL, '2026-09-04 07:47:29'),
(11, 6, 'الأنثراكنوز', 'ظهور بقع غائرة داكنة على الثمار وقد تكبر مع الوقت.', NULL, '2026-09-04 07:47:29'),
(12, 6, 'الذبول الفيوزاريومي', 'اصفرار الأوراق وذبول النبات تدريجيًا نتيجة تأثر الأوعية الناقلة.', NULL, '2026-09-04 07:47:29'),
(13, 7, 'العفن الرمادي', 'ظهور عفن رمادي على الثمار خاصة في الظروف الرطبة.', NULL, '2026-09-04 07:47:29'),
(14, 7, 'تبقع أوراق الفراولة', 'ظهور بقع صغيرة بنية أو أرجوانية على الأوراق.', NULL, '2026-09-04 07:47:29'),
(15, 10, 'البياض الزغبي في العنب', 'ظهور بقع صفراء على الأوراق ونمو أبيض على الأجزاء المصابة في الظروف المناسبة.', NULL, '2026-09-04 07:47:29'),
(16, 10, 'العفن الرمادي في العنب', 'ظهور عفن رمادي على العناقيد والثمار خاصة مع ارتفاع الرطوبة.', NULL, '2026-09-04 07:47:29'),
(17, 9, 'لفحة الأرز', 'ظهور بقع مميزة على الأوراق وقد تؤثر الإصابة الشديدة في نمو النبات.', NULL, '2026-09-04 07:47:29'),
(18, 9, 'تبقع أوراق الأرز', 'ظهور بقع بنية على الأوراق وقد تؤدي إلى ضعف عملية التمثيل الضوئي.', NULL, '2026-09-04 07:47:29'),
(19, 8, 'التبقع البني', 'ظهور بقع بنية على الأوراق وقد تتسع وتؤدي إلى تضرر الأنسجة.', NULL, '2026-09-04 07:47:29'),
(20, 8, 'الصدأ', 'ظهور بثرات صغيرة بلون بني أو برتقالي على الأوراق.', NULL, '2026-09-04 07:47:29');

-- --------------------------------------------------------

--
-- بنية الجدول `disease_images`
--

CREATE TABLE `disease_images` (
  `id` int(11) NOT NULL,
  `disease_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `view_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `disease_images`
--

INSERT INTO `disease_images` (`id`, `disease_id`, `image_path`, `view_type`) VALUES
(1, 1, '/images/diseases/early-blight-1.jpg', 'leaf'),
(2, 1, '/images/diseases/early-blight-2.jpg', 'plant'),
(3, 2, '/images/diseases/powdery-mildew-1.jpg', 'leaf'),
(4, 2, '/images/diseases/powdery-mildew-2.jpg', 'plant'),
(5, 3, '/images/diseases/wheat-rust-1.jpg', 'leaf'),
(6, 3, '/images/diseases/wheat-rust-2.jpg', 'leaf'),
(7, 4, '/images/diseases/wheat-powdery-mildew-1.jpg', 'leaf'),
(8, 4, '/images/diseases/wheat-powdery-mildew-2.jpg', 'leaf'),
(9, 5, '/images/diseases/corn-rust-1.jpg', 'leaf'),
(10, 5, '/images/diseases/corn-rust-2.jpg', 'leaf'),
(11, 6, '/images/diseases/corn-leaf-spot-1.jpg', 'leaf'),
(12, 6, '/images/diseases/corn-leaf-spot-2.jpg', 'leaf'),
(13, 7, '/images/diseases/late-blight-1.jpg', 'leaf'),
(14, 7, '/images/diseases/late-blight-2.jpg', 'leaf'),
(15, 8, '/images/diseases/common-scab-1.jpg', 'tuber'),
(16, 8, '/images/diseases/common-scab-2.jpg', 'tuber'),
(17, 9, '/images/diseases/cucumber-downy-mildew-1.jpg', 'leaf'),
(18, 9, '/images/diseases/cucumber-downy-mildew-2.jpg', 'leaf'),
(19, 10, '/images/diseases/cucumber-powdery-mildew-1.jpg', 'leaf'),
(20, 10, '/images/diseases/cucumber-powdery-mildew-2.jpg', 'leaf'),
(21, 11, '/images/diseases/pepper-anthracnose-1.jpg', 'fruit'),
(22, 11, '/images/diseases/pepper-anthracnose-2.jpg', 'fruit'),
(23, 12, '/images/diseases/fusarium-wilt-1.jpg', 'plant'),
(24, 12, '/images/diseases/fusarium-wilt-2.jpg', 'plant'),
(25, 13, '/images/diseases/strawberry-gray-mold-1.jpg', 'fruit'),
(26, 13, '/images/diseases/strawberry-gray-mold-2.jpg', 'fruit'),
(27, 14, '/images/diseases/strawberry-leaf-spot-1.jpg', 'leaf'),
(28, 14, '/images/diseases/strawberry-leaf-spot-2.jpg', 'leaf'),
(29, 15, '/images/diseases/grape-downy-mildew-1.jpg', 'leaf'),
(30, 15, '/images/diseases/grape-downy-mildew-2.jpg', 'leaf'),
(31, 16, '/images/diseases/grape-gray-mold-1.jpg', 'fruit'),
(32, 16, '/images/diseases/grape-gray-mold-2.jpg', 'fruit'),
(33, 17, '/images/diseases/rice-blast-1.jpg', 'leaf'),
(34, 17, '/images/diseases/rice-blast-2.jpg', 'leaf'),
(35, 18, '/images/diseases/rice-leaf-spot-1.jpg', 'leaf'),
(36, 18, '/images/diseases/rice-leaf-spot-2.jpg', 'leaf'),
(37, 19, '/images/diseases/onion-brown-spot-1.jpg', 'leaf'),
(38, 19, '/images/diseases/onion-brown-spot-2.jpg', 'leaf'),
(39, 20, '/images/diseases/onion-rust-1.jpg', 'leaf'),
(40, 20, '/images/diseases/onion-rust-2.jpg', 'leaf');

-- --------------------------------------------------------

--
-- بنية الجدول `farms`
--

CREATE TABLE `farms` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `crop_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `farms`
--

INSERT INTO `farms` (`id`, `user_id`, `name`, `location`, `area`, `crop_id`, `created_at`) VALUES
(1, NULL, 'مزرعة وادي النيل', 'المنوفية', 5.00, 4, '2026-09-14 19:30:59'),
(2, NULL, 'مزرعة النخيل', 'الجيزة', 10.00, 1, '2026-09-20 13:05:15'),
(4, 2, 'مزرعة المستقبل', 'المنصورة', 10.00, 1, '2026-09-26 18:55:07'),
(5, 2, 'مزرعة الامل', 'الجيزة', 5.00, 4, '2026-09-28 21:31:56'),
(6, 4, 'مزرعة الخير', 'طنطا', 8.00, 4, '2026-09-30 17:22:21'),
(7, 4, 'مزرعة الحصاد', 'القليوبية', 8.00, 1, '2026-10-07 20:21:18'),
(8, 4, 'مزرعة الشروق', 'القاهرة', 10.00, 7, '2026-10-11 12:31:16');

-- --------------------------------------------------------

--
-- بنية الجدول `scans`
--

CREATE TABLE `scans` (
  `id` int(11) NOT NULL,
  `farm_id` int(11) DEFAULT NULL,
  `device_id` int(11) DEFAULT NULL,
  `moisture` int(11) NOT NULL,
  `temperature` decimal(5,2) NOT NULL,
  `ph` decimal(4,2) DEFAULT NULL,
  `nitrogen` decimal(6,2) DEFAULT NULL,
  `phosphorus` decimal(6,2) DEFAULT NULL,
  `potassium` decimal(6,2) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `recommendation` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `scans`
--

INSERT INTO `scans` (`id`, `farm_id`, `device_id`, `moisture`, `temperature`, `ph`, `nitrogen`, `phosphorus`, `potassium`, `status`, `recommendation`, `created_at`) VALUES
(1, NULL, NULL, 55, 24.50, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-01 19:36:55'),
(2, NULL, NULL, 25, 27.30, NULL, NULL, NULL, NULL, 'DRY', 'Check soil moisture', '2026-09-02 20:28:34'),
(3, NULL, NULL, 40, 26.50, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-03 09:01:11'),
(4, 1, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-16 18:29:06'),
(5, 1, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-16 20:29:05'),
(6, 1, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-20 13:14:53'),
(7, 1, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-23 20:34:31'),
(8, 1, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-23 20:43:09'),
(9, 2, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-23 21:25:14'),
(10, 2, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-23 21:29:01'),
(11, 2, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-24 13:40:54'),
(12, 2, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-24 21:47:27'),
(13, 2, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-24 23:37:58'),
(14, 2, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-25 09:54:20'),
(15, 2, NULL, 46, 24.00, NULL, NULL, NULL, NULL, 'NORMAL', 'Soil condition looks normal', '2026-09-25 20:15:07'),
(16, 2, NULL, 46, 24.00, 6.81, 43.98, 53.77, 30.21, 'NORMAL', 'Soil condition looks normal', '2026-09-25 20:20:45'),
(17, 4, NULL, 46, 24.00, 6.81, 43.98, 53.77, 67.28, 'NORMAL', 'Soil condition looks normal', '2026-09-26 23:18:52'),
(18, 4, 1, 46, 24.00, 6.81, 43.98, 53.77, 56.14, 'NORMAL', 'Soil condition looks normal', '2026-09-27 13:49:21'),
(19, 4, 1, 46, 24.00, 6.81, 43.98, 53.77, 19.34, 'NORMAL', 'Soil condition looks normal', '2026-09-27 14:25:04'),
(20, 4, 1, 46, 24.00, 6.81, 43.98, 53.77, 85.42, 'NORMAL', 'Soil condition looks normal', '2026-09-27 21:18:37'),
(21, 4, 1, 46, 24.00, 6.81, 43.98, 53.77, 45.23, 'NORMAL', 'Soil condition looks normal', '2026-09-27 22:11:36'),
(22, 4, 1, 46, 24.00, 6.81, 43.98, 53.77, 42.88, 'NORMAL', 'Soil condition looks normal', '2026-09-27 22:47:04'),
(23, 4, 1, 46, 24.00, 6.81, 43.98, 53.77, 85.84, 'NORMAL', 'Soil condition looks normal', '2026-09-28 20:25:27'),
(24, 4, 1, 46, 24.00, 6.81, 43.98, 53.77, 44.81, 'NORMAL', 'Soil condition looks normal', '2026-09-28 21:25:57'),
(25, 5, 1, 46, 24.00, 6.81, 43.98, 53.77, 40.95, 'NORMAL', 'Soil condition looks normal', '2026-09-28 21:32:38'),
(26, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 41.83, 'NORMAL', 'Soil condition looks normal', '2026-09-30 18:38:37'),
(27, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 41.47, 'NORMAL', 'Soil condition looks normal', '2026-09-30 18:51:22'),
(28, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 73.55, 'NORMAL', 'Soil condition looks normal', '2026-10-01 06:24:13'),
(29, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 70.70, 'NORMAL', 'Soil condition looks normal', '2026-10-02 21:21:47'),
(30, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 85.96, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-03 08:05:00'),
(31, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 86.76, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-03 10:25:37'),
(32, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 83.20, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-03 12:18:42'),
(33, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 64.37, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-03 19:15:15'),
(34, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 65.74, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-03 19:16:04'),
(35, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 66.23, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-03 19:55:13'),
(36, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 64.15, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-03 20:05:49'),
(37, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 63.98, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-06 21:05:00'),
(38, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 63.08, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-07 19:55:49'),
(39, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 23.39, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-07 19:57:13'),
(40, 7, 1, 46, 24.00, 6.81, 43.98, 53.77, 24.03, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-07 20:21:40'),
(41, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 72.48, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-10 12:16:30'),
(42, 6, 1, 46, 24.00, 6.81, 43.98, 53.77, 71.11, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-10 16:56:08'),
(43, 7, 1, 46, 24.00, 6.81, 43.98, 53.77, 44.84, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-11 12:27:36'),
(44, 7, 1, 46, 24.00, 6.81, 43.98, 53.77, 49.30, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-11 12:28:12'),
(45, 7, 1, 46, 24.00, 6.81, 43.98, 53.77, 48.74, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-11 12:29:19'),
(46, 7, 1, 46, 24.00, 6.81, 43.98, 53.77, 47.74, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-11 12:29:31'),
(47, 8, 1, 46, 24.00, 6.81, 43.98, 53.77, 49.69, 'PENDING_EVALUATION', 'Evaluation pending', '2026-10-11 12:31:48');

-- --------------------------------------------------------

--
-- بنية الجدول `scan_measurements`
--

CREATE TABLE `scan_measurements` (
  `id` int(11) NOT NULL,
  `scan_id` int(11) NOT NULL,
  `parameter_id` int(11) NOT NULL,
  `value` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `scan_requests`
--

CREATE TABLE `scan_requests` (
  `id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `farm_id` int(11) NOT NULL,
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `scan_requests`
--

INSERT INTO `scan_requests` (`id`, `device_id`, `farm_id`, `status`, `created_at`, `started_at`, `completed_at`) VALUES
(1, 1, 4, 'COMPLETED', '2026-09-28 20:25:25', '2026-09-28 23:25:25', '2026-09-29 00:24:35'),
(2, 1, 4, 'COMPLETED', '2026-09-28 21:25:55', '2026-09-29 00:25:56', '2026-09-29 00:25:57'),
(3, 1, 5, 'COMPLETED', '2026-09-28 21:32:37', '2026-09-29 00:32:37', '2026-09-29 00:32:38'),
(4, 1, 6, 'COMPLETED', '2026-09-30 18:38:35', '2026-09-30 21:38:35', '2026-09-30 21:38:37'),
(5, 1, 6, 'COMPLETED', '2026-09-30 18:51:20', '2026-09-30 21:51:20', '2026-09-30 21:51:22'),
(6, 1, 6, 'COMPLETED', '2026-10-01 06:24:11', '2026-10-01 09:24:11', '2026-10-01 09:24:13'),
(7, 1, 6, 'COMPLETED', '2026-10-02 21:21:43', '2026-10-03 00:21:45', '2026-10-03 00:21:47'),
(8, 1, 6, 'COMPLETED', '2026-10-03 08:04:58', '2026-10-03 11:04:58', '2026-10-03 11:05:00'),
(9, 1, 6, 'COMPLETED', '2026-10-03 10:25:34', '2026-10-03 13:25:35', '2026-10-03 13:25:37'),
(10, 1, 6, 'COMPLETED', '2026-10-03 12:17:49', '2026-10-03 15:18:41', '2026-10-03 15:18:42'),
(11, 1, 6, 'COMPLETED', '2026-10-03 19:15:13', '2026-10-03 22:15:14', '2026-10-03 22:15:15'),
(12, 1, 6, 'COMPLETED', '2026-10-03 19:16:02', '2026-10-03 22:16:03', '2026-10-03 22:16:05'),
(13, 1, 6, 'COMPLETED', '2026-10-03 19:55:09', '2026-10-03 22:55:11', '2026-10-03 22:55:13'),
(14, 1, 6, 'COMPLETED', '2026-10-03 20:05:46', '2026-10-03 23:05:47', '2026-10-03 23:05:49'),
(15, 1, 6, 'COMPLETED', '2026-10-06 21:04:58', '2026-10-07 00:04:58', '2026-10-07 00:05:00'),
(16, 1, 6, 'COMPLETED', '2026-10-07 19:18:57', '2026-10-07 22:55:48', '2026-10-07 22:55:49'),
(17, 1, 6, 'COMPLETED', '2026-10-07 19:57:10', '2026-10-07 22:57:11', '2026-10-07 22:57:13'),
(18, 1, 7, 'COMPLETED', '2026-10-07 20:21:38', '2026-10-07 23:21:38', '2026-10-07 23:21:40'),
(19, 1, 6, 'COMPLETED', '2026-10-10 12:16:28', '2026-10-10 15:16:28', '2026-10-10 15:16:30'),
(20, 1, 6, 'COMPLETED', '2026-10-10 16:56:01', '2026-10-10 19:56:02', '2026-10-10 19:56:08'),
(21, 1, 7, 'COMPLETED', '2026-10-11 12:25:43', '2026-10-11 15:27:34', '2026-10-11 15:27:37'),
(22, 1, 7, 'COMPLETED', '2026-10-11 12:28:09', '2026-10-11 15:28:10', '2026-10-11 15:28:12'),
(23, 1, 7, 'COMPLETED', '2026-10-11 12:29:17', '2026-10-11 15:29:18', '2026-10-11 15:29:19'),
(24, 1, 7, 'COMPLETED', '2026-10-11 12:29:29', '2026-10-11 15:29:29', '2026-10-11 15:29:31'),
(25, 1, 8, 'COMPLETED', '2026-10-11 12:31:46', '2026-10-11 15:31:47', '2026-10-11 15:31:48');

-- --------------------------------------------------------

--
-- بنية الجدول `soil_parameters`
--

CREATE TABLE `soil_parameters` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `soil_parameters`
--

INSERT INTO `soil_parameters` (`id`, `name`, `unit`, `description`) VALUES
(1, 'pH', 'pH', 'درجة حموضة التربة'),
(2, 'Moisture', '%', 'نسبة رطوبة التربة'),
(3, 'Temperature', '°C', 'درجة الحرارة المقاسة بواسطة حساس DHT22. في النموذج الحالي تمثل درجة حرارة البيئة المحيطة بالحساس وليست درجة حرارة التربة مباشرة.'),
(4, 'Nitrogen', 'غير محدد', 'مستوى النيتروجين في التربة حسب طريقة القياس والمعايرة'),
(5, 'Phosphorus', 'غير محدد', 'مستوى الفوسفور في التربة حسب طريقة القياس والمعايرة'),
(6, 'Potassium', 'غير محدد', 'مستوى البوتاسيوم في التربة حسب طريقة القياس والمعايرة');

-- --------------------------------------------------------

--
-- بنية الجدول `treatments`
--

CREATE TABLE `treatments` (
  `id` int(11) NOT NULL,
  `disease_id` int(11) NOT NULL,
  `treatment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `treatments`
--

INSERT INTO `treatments` (`id`, `disease_id`, `treatment`, `created_at`) VALUES
(1, 1, 'إزالة الأوراق المصابة وتحسين التهوية واستخدام مبيد فطري مناسب حسب إرشادات الاستخدام.', '2026-09-04 07:53:27'),
(2, 2, 'تحسين التهوية وتقليل الرطوبة الزائدة واستخدام مبيد فطري مناسب حسب الإرشادات.', '2026-09-04 07:53:27'),
(3, 3, 'إزالة الأجزاء المصابة وتحسين التهوية واستخدام مبيد مناسب لصدأ القمح وفق الإرشادات الزراعية.', '2026-09-04 07:53:27'),
(4, 4, 'تحسين التهوية ومراقبة الإصابة واستخدام مبيد فطري مناسب وفق الإرشادات الزراعية.', '2026-09-04 07:53:27'),
(5, 5, 'إزالة الأوراق شديدة الإصابة ومراقبة الحقل واستخدام مبيد فطري مناسب حسب الإرشادات.', '2026-09-04 07:53:27'),
(6, 6, 'إزالة الأجزاء المصابة وتحسين التهوية ومتابعة انتشار البقع واستخدام معاملة مناسبة.', '2026-09-04 07:53:27'),
(7, 7, 'إزالة الأجزاء المصابة وتحسين التهوية وتجنب زيادة الرطوبة واستخدام مبيد مناسب حسب الإرشادات.', '2026-09-04 07:53:27'),
(8, 8, 'استخدام درنات سليمة وتحسين إدارة التربة وتجنب الظروف التي تساعد على انتشار المرض.', '2026-09-04 07:53:27'),
(9, 9, 'تحسين التهوية وتقليل الرطوبة على الأوراق واستخدام مبيد فطري مناسب وفق الإرشادات.', '2026-09-04 07:53:27'),
(10, 10, 'تحسين التهوية وتقليل الرطوبة واستخدام مبيد فطري مناسب حسب الإرشادات.', '2026-09-04 07:53:27'),
(11, 11, 'إزالة الثمار المصابة وتحسين التهوية وتجنب الرطوبة الزائدة واستخدام معاملة مناسبة.', '2026-09-04 07:53:27'),
(12, 12, 'إزالة النباتات شديدة الإصابة وتحسين تصريف التربة واستخدام أصناف أو شتلات سليمة.', '2026-09-04 07:53:27'),
(13, 13, 'إزالة الثمار المصابة وتقليل الرطوبة وتحسين التهوية ومتابعة الإصابة باستمرار.', '2026-09-04 07:53:27'),
(14, 14, 'إزالة الأوراق المصابة وتحسين التهوية وتقليل الرطوبة ومتابعة انتشار المرض.', '2026-09-04 07:53:27'),
(15, 15, 'تحسين التهوية وتقليل الرطوبة على الأوراق واستخدام مبيد فطري مناسب وفق الإرشادات.', '2026-09-04 07:53:27'),
(16, 16, 'إزالة الأجزاء المصابة وتحسين التهوية وتقليل الرطوبة ومتابعة العناقيد المصابة.', '2026-09-04 07:53:27'),
(17, 17, 'استخدام تقاوي سليمة ومراقبة الحقل وإزالة الأجزاء المصابة واستخدام معاملة مناسبة حسب الإرشادات.', '2026-09-04 07:53:27'),
(18, 18, 'إزالة الأجزاء شديدة الإصابة ومتابعة الحقل وتحسين إدارة المحصول حسب الإرشادات الزراعية.', '2026-09-04 07:53:27'),
(19, 19, 'إزالة الأجزاء المصابة وتحسين التهوية ومراقبة تطور البقع واستخدام معاملة مناسبة.', '2026-09-04 07:53:27'),
(20, 20, 'إزالة الأجزاء المصابة ومراقبة انتشار المرض واستخدام مبيد فطري مناسب وفق الإرشادات الزراعية.', '2026-09-04 07:53:27');

-- --------------------------------------------------------

--
-- بنية الجدول `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'doaa', 'doaa@test.com', '$2b$10$osKpp.SnbWPYcVj1xIVtieF5DPl4Ehs4wwDl/EtSjSFtebD/1NZdS', '2026-09-26 11:09:25'),
(2, 'doaa', 'doaa2@test.com', '$2b$10$OvNJExIbd0DCoI.l3k3Zbu56A1ibRXmwkozhX7mlYNqlrMHAMtt2m', '2026-09-26 11:42:40'),
(3, 'doaa', 'doaa3@test.com', '$2b$10$el8bxWh/e.BboO9ICdQbcucb3oh.FkIoPA6P7//5pNxosN3TwVIym', '2026-09-28 22:24:01'),
(4, 'doaa', 'dodo@test.com', '$2b$10$K0by00RWtyDhPTDaJkiVV.Tp4THngWzB9zzQIJU.6t7yWZb9SQqJy', '2026-09-29 17:19:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `crops`
--
ALTER TABLE `crops`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `crop_images`
--
ALTER TABLE `crop_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `crop_id` (`crop_id`);

--
-- Indexes for table `crop_soil_requirements`
--
ALTER TABLE `crop_soil_requirements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_crop_parameter` (`crop_id`,`parameter_id`),
  ADD KEY `fk_requirements_parameter` (`parameter_id`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_code` (`device_code`),
  ADD KEY `fk_devices_farm` (`farm_id`);

--
-- Indexes for table `diseases`
--
ALTER TABLE `diseases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `crop_id` (`crop_id`);

--
-- Indexes for table `disease_images`
--
ALTER TABLE `disease_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `disease_id` (`disease_id`);

--
-- Indexes for table `farms`
--
ALTER TABLE `farms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `crop_id` (`crop_id`),
  ADD KEY `fk_farms_user` (`user_id`);

--
-- Indexes for table `scans`
--
ALTER TABLE `scans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_scans_farm` (`farm_id`),
  ADD KEY `fk_scans_device` (`device_id`);

--
-- Indexes for table `scan_measurements`
--
ALTER TABLE `scan_measurements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scan_id` (`scan_id`),
  ADD KEY `parameter_id` (`parameter_id`);

--
-- Indexes for table `scan_requests`
--
ALTER TABLE `scan_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_scan_requests_device` (`device_id`),
  ADD KEY `fk_scan_requests_farm` (`farm_id`);

--
-- Indexes for table `soil_parameters`
--
ALTER TABLE `soil_parameters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `treatments`
--
ALTER TABLE `treatments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `disease_id` (`disease_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `crops`
--
ALTER TABLE `crops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `crop_images`
--
ALTER TABLE `crop_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `crop_soil_requirements`
--
ALTER TABLE `crop_soil_requirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `disease_images`
--
ALTER TABLE `disease_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `farms`
--
ALTER TABLE `farms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `scans`
--
ALTER TABLE `scans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `scan_measurements`
--
ALTER TABLE `scan_measurements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scan_requests`
--
ALTER TABLE `scan_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `soil_parameters`
--
ALTER TABLE `soil_parameters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `treatments`
--
ALTER TABLE `treatments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- قيود الجداول المُلقاة.
--

--
-- قيود الجداول `crop_images`
--
ALTER TABLE `crop_images`
  ADD CONSTRAINT `crop_images_ibfk_1` FOREIGN KEY (`crop_id`) REFERENCES `crops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- قيود الجداول `crop_soil_requirements`
--
ALTER TABLE `crop_soil_requirements`
  ADD CONSTRAINT `fk_requirements_crop` FOREIGN KEY (`crop_id`) REFERENCES `crops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_requirements_parameter` FOREIGN KEY (`parameter_id`) REFERENCES `soil_parameters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- قيود الجداول `devices`
--
ALTER TABLE `devices`
  ADD CONSTRAINT `fk_devices_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- قيود الجداول `diseases`
--
ALTER TABLE `diseases`
  ADD CONSTRAINT `diseases_ibfk_1` FOREIGN KEY (`crop_id`) REFERENCES `crops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- قيود الجداول `disease_images`
--
ALTER TABLE `disease_images`
  ADD CONSTRAINT `disease_images_ibfk_1` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- قيود الجداول `farms`
--
ALTER TABLE `farms`
  ADD CONSTRAINT `farms_ibfk_1` FOREIGN KEY (`crop_id`) REFERENCES `crops` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_farms_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- قيود الجداول `scans`
--
ALTER TABLE `scans`
  ADD CONSTRAINT `fk_scans_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_scans_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- قيود الجداول `scan_measurements`
--
ALTER TABLE `scan_measurements`
  ADD CONSTRAINT `scan_measurements_ibfk_1` FOREIGN KEY (`scan_id`) REFERENCES `scans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `scan_measurements_ibfk_2` FOREIGN KEY (`parameter_id`) REFERENCES `soil_parameters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- قيود الجداول `scan_requests`
--
ALTER TABLE `scan_requests`
  ADD CONSTRAINT `fk_scan_requests_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_scan_requests_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- قيود الجداول `treatments`
--
ALTER TABLE `treatments`
  ADD CONSTRAINT `treatments_ibfk_1` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
