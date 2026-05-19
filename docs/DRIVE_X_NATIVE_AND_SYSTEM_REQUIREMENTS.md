# Drive X - Native App and Full System Requirements

## 1. الهدف العام

Drive X هو نظام رقمي لمعرض سيارات يدعم عرض السيارات للبيع والإيجار، استقبال طلبات الزوار بدون تسجيل، إدارة المخزون من لوحة تحكم، متابعة العملاء المحتملين، تسجيل الصفقات، وحساب العمولات.

النظام الكامل يتكون من:

1. تطبيق Native للزوار باستخدام React Native.
2. لوحة تحكم Admin باستخدام React.
3. Backend API باستخدام Express.js + TypeScript.
4. قاعدة بيانات PostgreSQL.
5. تخزين صور السيارات محليا في MVP مع قابلية النقل لاحقا إلى S3 أو Cloudinary.

## 2. الهوية البصرية المطلوبة

### الشعار

الاسم المعتمد: `Drive X`.

الواجهة الحالية تم تعديل شعارها من `AUTOLUX / MOTORS` إلى:

```text
DRIVE X
MARKET
```

الفكرة البصرية الحالية للشعار:

1. دائرة ذهبية أو ملونة.
2. أيقونة سيارة داخل الدائرة.
3. كلمة Drive X بخط عريض.
4. كلمة صغيرة داعمة مثل Market أو Marketplace.

### ألوان التطبيق حسب docs/design_system.md

هذه الألوان مناسبة أكثر لهوية Drive X الجديدة:

```text
Background:       #0B0F19
Surface:          #121826
Primary Accent:   #00D2FF
Secondary Accent: #3A7BFF
Text:             #F0F6FC
Muted Text:       #9CA3AF
```

### ألوان لوحة التحكم

```text
Background:     #F8FAFC
Surface:        #FFFFFF
Border:         #E5E7EB
Text:           #111827
Muted Text:     #6B7280
Primary Action: #2563EB
Success:        #16A34A
Warning:        #D97706
Danger:         #DC2626
```

### ملاحظة مهمة

الواجهة الحالية في المشروع تستخدم ثيم فاخر أسود/ذهبي:

```text
Gold:      #CEAB55
Dark:      #0A0A0A
Card:      #141414
Text:      #F5F5F5
```

يوجد قرار تصميم مطلوب:

1. إما اعتماد هوية Drive X الجديدة: أزرق/سماوي داكن كما في docs.
2. أو إبقاء ثيم الفخامة الأسود/الذهبي للتطبيق العام.
3. أو استخدام الأزرق/السماوي للـ Drive X الأساسي، والذهب فقط كلمسة premium للسيارات الفاخرة.

توصيتي: اعتماد ألوان Drive X من `design_system.md` للتطبيق Native، مع استخدام الذهب فقط كـ accent ثانوي للسيارات المميزة أو الباقات الخاصة.

## 3. المستخدمون والصلاحيات

### Visitor

لا يحتاج تسجيل دخول.

يستطيع:

1. تصفح السيارات.
2. البحث والفلترة.
3. مشاهدة تفاصيل السيارة.
4. إرسال طلب شراء أو إيجار.
5. طلب توصيل اختياري عند إرسال الطلب.

### Admin

يدخل من لوحة تحكم.

الأدوار:

1. `OWNER`: صلاحيات كاملة.
2. `STAFF`: تشغيل يومي بدون إدارة الموظفين مستقبلا.

يستطيع:

1. إدارة السيارات.
2. رفع وحذف صور السيارات.
3. متابعة طلبات الزوار.
4. تغيير حالة الطلبات.
5. تسجيل الصفقات.
6. متابعة العمولات والمؤشرات.

## 4. شاشات تطبيق React Native

### 4.1 Splash / Launch

المطلوب:

1. شعار Drive X.
2. خلفية داكنة.
3. تحميل خفيف أو انتقال سريع.

### 4.2 Home / Catalog

المطلوب:

1. Header يحتوي شعار Drive X وزر بحث.
2. قائمة سيارات مع pagination أو infinite scroll.
3. كروت سيارات تحتوي:
   - صورة.
   - Brand + Model + Year.
   - السعر أو سعر الإيجار.
   - badge لنوع العرض: Sale, Rent, Both.
   - حالة السيارة: Available, Reserved.
   - CTA لعرض التفاصيل.
4. قسم فلاتر سريع.

Endpoint:

```text
GET /v1/public/cars
```

### 4.3 Search and Filters

الفلاتر المطلوبة:

1. Brand.
2. Model أو search keyword.
3. Price range.
4. Year.
5. Condition.
6. Fuel type.
7. Listing type: SALE, RENT, BOTH.

Endpoint:

```text
GET /v1/public/meta/filters
GET /v1/public/cars
```

### 4.4 Car Details

المطلوب:

1. معرض صور.
2. معلومات السيارة الأساسية.
3. المواصفات:
   - Brand.
   - Model.
   - Year.
   - Mileage.
   - Fuel.
   - Transmission.
   - Condition.
4. السعر:
   - Sale price عند البيع.
   - Daily أو monthly rent عند الإيجار.
5. حالة السيارة.
6. زر Request Buy أو Request Rent.

Endpoint:

```text
GET /v1/public/cars/{carId}
```

### 4.5 Buy / Rent Request Form

الحقول المطلوبة:

1. carId.
2. intent: BUY أو RENT.
3. fullName.
4. phone.
5. email اختياري.
6. rentalStartDate و rentalEndDate عند RENT.
7. requestDelivery.
8. deliveryAddress عند requestDelivery=true.
9. notes اختياري.

Endpoint:

```text
POST /v1/public/leads
```

### 4.6 Success State

بعد إرسال الطلب:

1. رسالة نجاح واضحة.
2. تأكيد أن فريق المعرض سيتواصل مع العميل.
3. زر رجوع إلى catalog.

## 5. شاشات لوحة التحكم React Admin

### 5.1 Login

Endpoints:

```text
POST /v1/admin/auth/login
POST /v1/admin/auth/refresh
POST /v1/admin/auth/logout
GET /v1/admin/auth/me
```

المطلوب:

1. JWT access token.
2. Refresh token.
3. تخزين آمن.
4. حماية صفحات لوحة التحكم.

### 5.2 Dashboard Overview

المؤشرات المطلوبة:

1. Total cars.
2. Active leads.
3. Conversion rate.
4. Monthly commission.
5. Available cars.
6. Reserved cars.

Endpoint:

```text
GET /v1/admin/dashboard/summary
```

### 5.3 Cars Management

المطلوب:

1. جدول سيارات.
2. بحث وفلاتر.
3. إضافة سيارة.
4. تعديل سيارة.
5. حذف soft delete.
6. رفع صور.
7. حذف صور.

Endpoints:

```text
GET /v1/admin/cars
POST /v1/admin/cars
GET /v1/admin/cars/{carId}
PATCH /v1/admin/cars/{carId}
DELETE /v1/admin/cars/{carId}
POST /v1/admin/cars/{carId}/images
DELETE /v1/admin/cars/{carId}/images/{imageId}
```

### 5.4 Leads Inbox

حالات الطلب:

```text
NEW
CONTACTED
NEGOTIATING
APPROVED
REJECTED
CLOSED
```

المطلوب:

1. قائمة الطلبات.
2. فلترة حسب الحالة.
3. عرض تفاصيل الطلب.
4. تحديث الحالة.
5. إضافة notes.

Endpoints:

```text
GET /v1/admin/leads
GET /v1/admin/leads/{leadId}
PATCH /v1/admin/leads/{leadId}
```

### 5.5 Deals and Commission

المطلوب:

1. تسجيل صفقة من lead.
2. نوع الصفقة: SALE أو RENT.
3. finalPrice.
4. commissionType: PERCENTAGE أو FIXED.
5. commissionValue.
6. commissionAmount يحسب من backend وليس frontend.

Endpoints:

```text
GET /v1/admin/deals
POST /v1/admin/deals
```

## 6. Backend Modules

حسب `API_INTEGRATION_GUIDE.md`:

```text
src/modules/auth
src/modules/cars
src/modules/leads
src/modules/deals
src/modules/dashboard
```

المطلوب في كل module:

1. Routes.
2. Controllers.
3. Services.
4. Zod validation.
5. Database queries.
6. Standard error handling.

## 7. Database Entities

من `schema.sql`:

1. admin_users.
2. refresh_tokens.
3. cars.
4. car_images.
5. leads.
6. deals.

Enums المطلوبة:

```text
listing_type: SALE, RENT, BOTH
transmission_type: AUTOMATIC, MANUAL
fuel_type: GASOLINE, DIESEL, HYBRID, ELECTRIC
car_condition: NEW, USED
car_status: AVAILABLE, RESERVED, SOLD, RENTED, INACTIVE
lead_intent: BUY, RENT
lead_status: NEW, CONTACTED, NEGOTIATING, APPROVED, REJECTED, CLOSED
deal_type: SALE, RENT
commission_type: PERCENTAGE, FIXED
admin_role: OWNER, STAFF
```

## 8. API Contracts

الملفات المعتمدة:

1. `docs/openapi.yaml`: العقد الكامل.
2. `docs/openapi.native-public.yaml`: عقد تطبيق React Native.
3. `docs/openapi.frontend-admin.yaml`: عقد لوحة التحكم.
4. `docs/openapi.backend.yaml`: عقد الباكند.

قاعدة مهمة:

1. تطبيق Native يستخدم فقط `/v1/public/*`.
2. لوحة Admin تستخدم فقط `/v1/admin/*`.
3. لا يوجد login للزائر في MVP.
4. كل admin routes تحتاج JWT.

## 9. Validation Rules

1. طلب الزائر يحتاج على الأقل: `carId`, `intent`, `fullName`, `phone`.
2. عند `intent=RENT` يجب إدخال `rentalStartDate` و `rentalEndDate`.
3. عند `requestDelivery=true` يجب إدخال `deliveryAddress`.
4. عند `listingType=SALE` أو `BOTH` يجب وجود sale price.
5. عند `listingType=RENT` أو `BOTH` يجب وجود daily أو monthly rent price.
6. حذف السيارة يجب أن يكون soft delete باستخدام `deletedAt`.
7. public catalog يعرض فقط `AVAILABLE` و `RESERVED`.
8. العملات المدعومة في MVP: `USD` و `SYP`.

## 10. Pagination and Error Shape

كل endpoint فيه pagination يرجع:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0,
  "totalPages": 0,
  "hasNext": false
}
```

شكل الخطأ:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request payload",
  "details": ["phone must be valid"]
}
```

## 11. Security Requirements

1. JWT access/refresh للوحة التحكم.
2. تخزين refresh tokens hashed في قاعدة البيانات.
3. revoke refresh token عند logout.
4. Rate limit على `POST /v1/public/leads`.
5. RBAC بين OWNER و STAFF.
6. Admin API لا يكون متاحا للتطبيق العام.

## 12. Image Requirements

في MVP:

```text
uploads/cars/{carId}/
```

يجب تخزين:

1. image_url.
2. storage_key.
3. local_path.
4. ترتيب الصورة.
5. هل الصورة primary أم لا.

لاحقا يمكن نقل التخزين إلى S3 أو Cloudinary بدون تغيير frontend contracts.

## 13. ما يجب أخذه من الواجهة الحالية

الواجهة الحالية مفيدة كمرجع بصري وتجربة:

1. Hero section مع صورة سيارة.
2. Vehicle card design.
3. Car detail gallery.
4. Search and filters.
5. Admin dashboard layout.
6. Auth screens.
7. صور السيارات داخل `public`.

لكن يجب تعديلها لتتطابق مع docs:

1. دعم البيع والإيجار وليس البيع فقط.
2. إزالة فكرة حساب زائر وفavorites من MVP.
3. جعل طلبات الزوار بدون تسجيل.
4. تحويل dashboard إلى إدارة حقيقية للسيارات والطلبات والصفقات.
5. ربط كل شيء بعقود OpenAPI.

## 14. مراحل التنفيذ المقترحة

### المرحلة 1: تثبيت الهوية والنماذج

1. اعتماد شعار Drive X النهائي.
2. اختيار اللون النهائي: أزرق Drive X أو أسود/ذهبي.
3. تجهيز tokens للتطبيق والداشبورد.
4. تجهيز types من OpenAPI.

### المرحلة 2: Backend

1. إنشاء Express.js + TypeScript project.
2. تنفيذ schema.
3. تنفيذ auth.
4. تنفيذ cars module.
5. تنفيذ leads module.
6. تنفيذ deals module.
7. تنفيذ dashboard summary.

### المرحلة 3: React Native

1. Home/catalog.
2. Filters.
3. Car details.
4. Buy/rent request form.
5. Success state.
6. API integration.

### المرحلة 4: Admin Dashboard

1. Login.
2. Dashboard KPIs.
3. Cars CRUD.
4. Image upload.
5. Leads inbox.
6. Deals and commissions.

### المرحلة 5: QA and Demo

1. Test public browse flow.
2. Test buy request.
3. Test rent request.
4. Test admin login.
5. Test car CRUD.
6. Test lead status update.
7. Test deal commission calculation.
8. Prepare thesis/demo presentation.

## 15. Later Upgrades

من `upgrade_later.md`:

1. CAPTCHA للطلبات العامة.
2. Staff management كامل.
3. E2E tests.
4. Audit logs.
5. Error tracking.
6. API versioning policy.
7. Object storage للصور.
8. WhatsApp/email/push notifications.
9. Public SEO web pages.

## 16. قرارات مطلوبة قبل بدء النسخة Native

1. هل نعتمد ألوان Drive X الرسمية من docs أم نحافظ على الأسود/الذهبي؟
2. هل اسم الشعار الفرعي يكون `MARKET`, `MOTORS`, أو بدون سطر فرعي؟
3. هل التطبيق Arabic-first من أول نسخة أم English UI ثم localization؟
4. هل الأسعار الأساسية USD فقط أم USD و SYP ظاهرة للمستخدم؟
5. هل الإيجار يومي فقط أم يومي وشهري؟
6. هل طلب التوصيل متاح لكل السيارات أم حسب المدينة/المعرض؟
7. هل OWNER و STAFF يكفيان للـ MVP؟

