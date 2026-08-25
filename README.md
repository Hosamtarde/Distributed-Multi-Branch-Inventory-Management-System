<div align="center">

# 🏬 Distributed Multi-Branch Inventory Management System
### نظام إدارة مخزون موزّع متعدد الفروع

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

نظام Backend متكامل لإدارة سلسلة متاجر متعددة الفروع، يحاكي تحديات حقيقية تواجهها الشركات في القطاع التجاري: **Concurrency، Event-Driven Architecture، وRole-Based Access Control**.

[نظرة عامة](#-نظرة-عامة) •
[المشاكل التقنية](#-المشاكل-التقنية-التي-يحلها-المشروع) •
[التقنيات](#️-التقنيات-المستخدمة) •
[البدء السريع](#-البدء-السريع) •
[الـ API](#-توثيق-api) •
[خارطة الطريق](#-خارطة-الطريق)

</div>

---

## 📖 نظرة عامة

نظام Backend مبني لإدارة سلسلة متاجر لها أكثر من فرع، بحيث:

- 🏢 كل فرع له مخزونه الخاص من كل منتج
- 🛒 يوجد متجر إلكتروني مركزي يخدم كل الفروع
- 🎯 النظام يقرر تلقائياً أي فرع يُلبّي كل طلب حسب القرب وتوفر الكمية
- 🔒 النظام يمنع "البيع الزائد" (Overselling) حتى في حالات الطلبات المتزامنة

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

### 1️⃣ التعامل مع الطلبات المتزامنة (Concurrency & Locking)
منع **Race Conditions** التي قد تؤدي لبيع نفس المنتج لأكثر من زبون في نفس اللحظة، عبر آليات **Pessimistic/Optimistic Locking**.

### 2️⃣ التزامن بين الفروع (Event-Driven Architecture)
نشر التحديثات اللحظية (نفاذ منتج، تحديث مخزون) عبر **EventEmitter** و **WebSocket**، بدلاً من الاستعلام المستمر البطيء.

### 3️⃣ محرك تحديد جهة التلبية (Fulfillment Engine)
خوارزمية تحدد أي فرع (أو أكثر) يُلبّي كل طلب أونلاين بناءً على القرب الجغرافي وتوفر المخزون.

---

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| **Backend Framework** | NestJS (TypeScript) |
| **قاعدة البيانات** | PostgreSQL |
| **ORM** | TypeORM |
| **المصادقة** | JWT + Passport (Access & Refresh Tokens) |
| **التحقق من البيانات** | class-validator / class-transformer |
| **البيئة** | Docker |
| **الأحداث اللحظية** *(قادم)* | EventEmitter / Socket.io |
| **الطوابير** *(قادم)* | BullMQ + Redis |

---

## 🏗️ البنية المعمارية

المشروع مبني على معمارية **Modular** — كل ميزة في وحدة مستقلة تحتوي على:

```
src/
├── auth/                  # آليات الحماية العامة (Guards, Strategies, Decorators)
├── users/                 # المصادقة وإدارة المستخدمين
│   ├── dto/
│   ├── entities/
│   ├── enums/
│   └── ...
├── branches/               # إدارة الفروع
├── categories/              # فئات المنتجات
├── products/                 # المنتجات ومتغيراتها (Variants)
│   └── products-variants/
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
| 4 | Inventory Management (Locking) | 🔄 قيد التطوير |
| 5 | Orders (Online + POS) | ⬜ قادم |
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
| 🏪 **Branch Manager** | `branch_manager` | إدارة فرع واحد محدد |
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

# 4. إعداد ملف البيئة
# أنشئ ملف .env وأضف المتغيرات المطلوبة (راجع .env.example)

# 5. تشغيل بيانات تجريبية (اختياري)
npm run seed

# 6. تشغيل المشروع
npm run start:dev
```

### الحسابات التجريبية (بعد تشغيل `npm run seed`)

| الحساب | كلمة السر | الدور |
|---|---|---|
| `admin@test.com` | `123456` | Admin |
| `manager@test.com` | `123456` | Branch Manager |
| `staff@test.com` | `123456` | Staff |

---

## 📡 توثيق API

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
| `GET` | `/branches/:id` | عرض فرع محدد | 🔒 |
| `POST` | `/branches` | إضافة فرع جديد | 🔒👑 |
| `PUT` | `/branches/:id` | تعديل فرع | 🔒👑 |
| `DELETE` | `/branches/:id` | حذف فرع | 🔒👑 |

### 🗂️ Categories

| Method | Endpoint | الوصف | الحماية |
|---|---|---|:---:|
| `GET` | `/categories` | عرض كل الفئات | 🔒 |
| `POST` | `/categories` | إضافة فئة | 🔒👑 |
| `PUT` | `/categories/:id` | تعديل فئة | 🔒👑 |
| `DELETE` | `/categories/:id` | حذف فئة | 🔒👑 |

### 📦 Products & Variants

| Method | Endpoint | الوصف | الحماية |
|---|---|---|:---:|
| `GET` | `/products` | عرض كل المنتجات | 🔒 |
| `POST` | `/products` | إضافة منتج جديد | 🔒👑 |
| `GET` | `/product-variants/by-product/:id` | عرض نسخ منتج معين | 🔒 |
| `POST` | `/product-variants` | إضافة نسخة منتج | 🔒👑 |

> 🔓 مفتوح · 🔒 يتطلب تسجيل دخول · 👑 يتطلب صلاحية Admin

---

## 🧪 الاختبار

المشروع تم اختباره بالكامل يدوياً عبر **Postman** لكل Endpoint، متضمناً:

- ✅ اختبار الحماية (401 عند غياب Token)
- ✅ اختبار الصلاحيات (403 عند نقص الصلاحية)
- ✅ اختبار نجاح العمليات (200/201)
- ✅ اختبار العلاقات بين الجداول (Category ↔ Product ↔ Variant)
- ✅ اختبار القيود (SKU الفريد، الإيميل الفريد، إلخ)

---

## 📸 لقطات من المشروع

<div align="center">

> 💡 *أضف لقطات شاشة من Postman أو pgAdmin هنا لاحقاً، مثلاً:*

| تسجيل الدخول | إدارة الفروع | ربط المنتج بالفئة |
|:---:|:---:|:---:|
| `screenshot-login.png` | `screenshot-branches.png` | `screenshot-products.png` |

</div>

---

## 🗺️ خارطة الطريق

- [x] نظام مصادقة كامل (JWT + Refresh Tokens + RBAC)
- [x] إدارة الفروع
- [x] إدارة المنتجات والفئات والنسخ (Variants)
- [ ] نظام المخزون مع Locking لمنع البيع الزائد
- [ ] محرك الطلبات وتحديد جهة التلبية
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
