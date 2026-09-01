<div align="center">

# 🏬 Distributed Multi-Branch Inventory Management System
### نظام إدارة مخزون موزّع متعدد الفروع

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

نظام Backend متكامل لإدارة سلسلة متاجر متعددة الفروع، يحاكي تحديات حقيقية تواجهها الشركات في القطاع التجاري: **Concurrency، Pessimistic Locking، وRole-Based Access Control**.

[نظرة عامة](#-نظرة-عامة) •
[المشاكل التقنية](#-المشاكل-التقنية-التي-يحلها-المشروع) •
[التقنيات](#️-التقنيات-المستخدمة) •
[البدء السريع](#-البدء-السريع) •
[الـ API](#-توثيق-api) •
[الأوامر المرجعية](#-أوامر-git-المرجعية) •
[خارطة الطريق](#-خارطة-الطريق)

</div>

---

## 📖 نظرة عامة

نظام Backend مبني لإدارة سلسلة متاجر لها أكثر من فرع، بحيث:

- 🏢 كل فرع له مخزونه الخاص من كل منتج (بمستوى الـ Variant تحديداً)
- 🛒 يوجد متجر إلكتروني مركزي يخدم كل الفروع
- 🔒 النظام يمنع "البيع الزائد" (Overselling) حتى في حالات الطلبات المتزامنة تماماً — **مُختبر ومُثبت فعلياً** عبر سكربت محاكاة تزامن حقيقي
- 🎯 النظام يقرر تلقائياً أي فرع يُلبّي كل طلب حسب القرب وتوفر الكمية *(قادم)*

<div align="center">

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  فرع نابلس   │     │  فرع رام الله │     │  فرع الخليل  │
│  📦 مخزون    │     │  📦 مخزون    │     │  📦 مخزون    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │   النظام المركزي    │
                  │  (NestJS + Postgres) │
                  └─────────┬──────────┘
                            │
                  ┌─────────▼──────────┐
                  │   المتجر الإلكتروني  │
                  └────────────────────┘
```

</div>

---

## 🎯 المشاكل التقنية التي يحلها المشروع

### 1️⃣ التعامل مع الطلبات المتزامنة (Pessimistic Locking) ✅ مُنجز ومُختبر
منع **Race Conditions** التي قد تؤدي لبيع نفس المنتج لأكثر من زبون في نفس اللحظة، عبر **Pessimistic Write Locking** حقيقي على مستوى قاعدة البيانات (`FOR UPDATE`) داخل Transaction متكاملة.

تم التحقق من هذه الآلية عملياً عبر سكربت Node.js يرسل طلبين متزامنين تماماً (`Promise.all`) على نفس السجل، وتأكيد أن أحدهما فقط ينجح بينما يُرفض الآخر برسالة واضحة.

### 2️⃣ نظام صلاحيات متعدد المستويات (RBAC)
ثلاثة أدوار (`Admin`, `Branch Manager`, `Staff`) مع حماية مزدوجة (`JwtAuthGuard` + `RolesGuard`) على مستوى كل Endpoint حساس.

### 3️⃣ محرك تحديد جهة التلبية (Fulfillment Engine) *(قادم)*
خوارزمية تحدد أي فرع (أو أكثر) يُلبّي كل طلب أونلاين بناءً على القرب الجغرافي وتوفر المخزون.

---

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| **Backend Framework** | NestJS (TypeScript) |
| **قاعدة البيانات** | PostgreSQL |
| **ORM** | TypeORM (مع Migrations، بدون `synchronize`) |
| **المصادقة** | JWT + Passport (Access & Refresh Tokens) |
| **التحقق من البيانات** | class-validator / class-transformer |
| **التوثيق التفاعلي** | Swagger / OpenAPI |
| **الأمان** | Helmet, Rate Limiting (Throttler), bcrypt |
| **البيئة** | Docker |
| **الأحداث اللحظية** *(قادم)* | EventEmitter / Socket.io |
| **الطوابير** *(قادم)* | BullMQ + Redis |

---

## 🏗️ البنية المعمارية

المشروع مبني على معمارية **Modular** — كل ميزة في وحدة مستقلة تحتوي على:

```
src/
├── auth/                     # آليات الحماية العامة (Guards, Strategies, Decorators)
├── users/                    # المصادقة وإدارة المستخدمين (يشمل Auth Controller/Service)
│   ├── dto/
│   ├── entities/
│   └── enums/                # Role Enum (admin, branch_manager, staff)
├── branches/                 # إدارة الفروع
├── categories/                # فئات المنتجات
├── products/                   # المنتجات
│   └── products-variants/      # نسخ المنتج (SKU, السعر, الحجم/اللون)
├── inventory/                    # المخزون لكل فرع + Pessimistic Locking
├── common/
│   ├── filters/                    # Global Exception Filter
│   └── interceptors/                # Global Response Interceptor
├── migrations/                        # TypeORM Migrations
└── app.module.ts
```

كل موديول يتبع نمط ثابت: `Entity → DTO → Service → Controller → Module`، مع حماية عبر `JwtAuthGuard` و `RolesGuard`.

---

## ✅ الحالة الحالية للمشروع

<div align="center">

| # | الموديول | الحالة |
|:---:|---|:---:|
| 0 | Setup (Docker, PostgreSQL, TypeORM) | ✅ منجز |
| 1 | Authentication & Users (JWT, Roles, Refresh Tokens) | ✅ منجز |
| 2 | Branches Management | ✅ منجز |
| 3 | Products & Categories & Variants | ✅ منجز |
| 4 | Inventory Management (Pessimistic Locking) | ✅ منجز ومُختبر |
| — | **Production Hardening** (Migrations, Helmet, Swagger, Filters) | ✅ منجز |
| 5 | Orders (Online + POS) | 🔄 قيد التطوير |
| 6 | Fulfillment Engine | ⬜ قادم |
| 7 | Returns & Refunds | ⬜ قادم |
| 8 | Inter-Branch Transfer | ⬜ قادم |
| 9 | Suppliers & Purchase Orders | ⬜ قادم |
| 10 | Pricing & Promotions | ⬜ قادم |
| 11 | Events & Real-time Notifications | ⬜ قادم |
| 12 | Audit Log | ⬜ قادم |
| 13 | Reports & Analytics | ⬜ قادم |
| 14 | Multi-Tenancy | ⬜ قادم |

</div>

---

## 🔐 نظام الأدوار (RBAC)

| الدور | القيمة | الصلاحيات |
|---|---|---|
| 👑 **Admin** | `admin` | صلاحية كاملة على كل النظام |
| 🏪 **Branch Manager** | `branch_manager` | إدارة فرع واحد محدد (بما فيه المخزون) |
| 👤 **Staff** | `staff` | عمليات البيع وعرض المخزون |

---

## 🚀 البدء السريع

### المتطلبات الأساسية

- [Node.js](https://nodejs.org/) (LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### التثبيت

```bash
# 1. استنساخ المشروع
git clone https://github.com/Hosamtarde/Distributed-Multi-Branch-Inventory-Management-System.git
cd Distributed-Multi-Branch-Inventory-Management-System/inventory-system

# 2. تثبيت الحزم
npm install

# 3. تشغيل قاعدة البيانات عبر Docker
docker run --name inventory-postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=inventory_db -p 5432:5432 -d postgres:16

# 4. إعداد ملف البيئة (.env) — راجع المتغيرات المطلوبة أدناه

# 5. تشغيل الـ Migrations لبناء كل الجداول
npm run migration:run

# 6. تشغيل بيانات تجريبية (اختياري)
npm run seed

# 7. تشغيل المشروع
npm run start:dev
```

### متغيرات البيئة المطلوبة (`.env`)

```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=inventory_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=30d
```

### الحسابات التجريبية (بعد تشغيل `npm run seed`)

| الحساب | كلمة السر | الدور |
|---|---|---|
| `admin@test.com` | `123456` | Admin |
| `manager@test.com` | `123456` | Branch Manager |
| `staff@test.com` | `123456` | Staff |

### التوثيق التفاعلي (Swagger)

بعد تشغيل المشروع، افتح:
```
http://localhost:3000/api-docs
```

---

## 📡 توثيق API

> 💡 التوثيق الكامل والتفاعلي متاح عبر Swagger على `/api-docs`. الجدول التالي ملخص سريع.

### 🔑 Authentication

| Method | Endpoint | الوصف | الحماية |
|---|---|---|:---:|
| `POST` | `/auth/register` | تسجيل حساب جديد | 🔓 |
| `POST` | `/auth/login` | تسجيل الدخول | 🔓 |
| `POST` | `/auth/refresh` | تجديد Access Token | 🔓 |
| `POST` | `/auth/logout` | تسجيل الخروج | 🔓 |
| `GET` | `/auth/me` | بيانات المستخدم الحالي | 🔒 |

### 🏢 Branches

| Method | Endpoint | الوصف | الحماية |
|---|---|---|:---:|
| `GET` | `/branches` | عرض كل الفروع | 🔒 |
| `POST` | `/branches` | إضافة فرع جديد | 🔒👑 |
| `PUT` | `/branches/:id` | تعديل فرع | 🔒👑 |
| `DELETE` | `/branches/:id` | حذف فرع | 🔒👑 |

### 🗂️ Categories & 📦 Products & Variants

| Method | Endpoint | الوصف | الحماية |
|---|---|---|:---:|
| `GET` | `/categories` | عرض كل الفئات | 🔒 |
| `POST` | `/categories` | إضافة فئة | 🔒👑 |
| `GET` | `/products` | عرض كل المنتجات (مع الفئة) | 🔒 |
| `POST` | `/products` | إضافة منتج مرتبط بفئة | 🔒👑 |
| `GET` | `/product-variants/by-product/:id` | عرض نسخ منتج معين | 🔒 |
| `POST` | `/product-variants` | إضافة نسخة منتج (SKU, سعر) | 🔒👑 |

### 📊 Inventory

| Method | Endpoint | الوصف | الحماية |
|---|---|---|:---:|
| `GET` | `/inventory` | عرض كل سجلات المخزون | 🔒 |
| `GET` | `/inventory/branch/:branchId` | مخزون فرع معين | 🔒 |
| `POST` | `/inventory` | إنشاء سجل مخزون أولي | 🔒👑🏪 |
| `PUT` | `/inventory/:id/adjust` | تعديل الكمية (بيع/إضافة) — محمي بـ Pessimistic Locking | 🔒👑🏪 |

> 🔓 مفتوح · 🔒 يتطلب تسجيل دخول · 👑 يتطلب صلاحية Admin · 🏪 أو Branch Manager

---

## 🧪 الاختبار

المشروع تم اختباره بالكامل يدوياً عبر **Postman** لكل Endpoint، بالإضافة إلى **اختبار تزامن حقيقي** لآلية الـ Locking:

- ✅ اختبار الحماية (401 عند غياب Token)
- ✅ اختبار الصلاحيات (403 عند نقص الصلاحية)
- ✅ اختبار نجاح العمليات (200/201)
- ✅ اختبار العلاقات بين الجداول (Category ↔ Product ↔ Variant ↔ Inventory)
- ✅ اختبار القيود (SKU الفريد، الإيميل الفريد، منع تكرار سجل المخزون)
- ✅ **اختبار Race Condition حقيقي**: إرسال طلبين متزامنين تماماً على نفس سجل المخزون، والتأكد أن واحداً فقط ينجح دون Overselling

---

## 📚 أوامر Git المرجعية

للرجوع إليها بسرعة أثناء العمل اليومي على المشروع.

### الاستخدام اليومي

```bash
# رؤية حالة الملفات المعدّلة
git status

# تجهيز كل التعديلات للـ commit
git add .

# تسجيل لقطة (commit) مع رسالة واضحة
git commit -m "وصف قصير وواضح لما تم إنجازه"

# رفع التعديلات إلى GitHub
git push

# سحب أي تعديلات جديدة من GitHub (مهم قبل البدء بالعمل كل مرة)
git pull origin main
```

### عند تعارض الدفع (Push Rejected)

يحدث عادة عند تعديل ملف (مثل `README.md`) مباشرة من واجهة GitHub:

```bash
git pull origin main
# إذا فتح محرر نصوص (Vim) لرسالة الدمج:
#   اضغط Esc ثم اكتب :wq ثم Enter

git push
```

### أوامر Docker المرتبطة بقاعدة البيانات

```bash
# تشغيل الحاوية بعد كل إعادة تشغيل للجهاز
docker start inventory-postgres

# التأكد من أن الحاوية تعمل
docker ps

# عرض كل الحاويات (حتى المتوقفة)
docker ps -a
```

### أوامر Migrations

```bash
# توليد migration جديدة تلقائياً بعد تعديل أي Entity
npm run migration:generate -- src/migrations/DescriptiveName

# تطبيق كل الـ Migrations الجديدة
npm run migration:run

# التراجع عن آخر migration
npm run migration:revert
```

---

## 🗺️ خارطة الطريق

- [x] نظام مصادقة كامل (JWT + Refresh Tokens + RBAC)
- [x] إدارة الفروع
- [x] إدارة المنتجات والفئات والنسخ (Variants)
- [x] نظام المخزون مع Pessimistic Locking لمنع البيع الزائد
- [x] بنية جاهزة للإنتاج (Migrations, Helmet, Swagger, Global Filters/Interceptors)
- [ ] نظام الطلبات (Orders) وربطه بخصم المخزون التلقائي
- [ ] محرك تحديد جهة التلبية (Fulfillment Engine)
- [ ] إشعارات لحظية عبر WebSocket
- [ ] تقارير وتحليلات شاملة
- [ ] دعم Multi-Tenancy

---

## 👨‍💻 المطوّر

**Hosam Tarde**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Hosamtarde)

---

<div align="center">

⭐ إذا أعجبك المشروع، لا تنسَ إعطاءه نجمة!

</div>