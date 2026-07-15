# CloudVault — Secure Cloud File Storage Platform

CloudVault is a full-stack file storage web application built with Node.js,
Express, EJS, and SQLite. It runs **entirely on localhost** — no AWS
account, credentials, or external services are required — but it is
**architected from day one so that Amazon S3, DynamoDB, SNS, and
CloudWatch can be dropped in later with minimal code changes.**

---

## 1. Project Overview

CloudVault lets registered users:

- Create an account and log in securely (bcrypt-hashed passwords, sessions)
- Upload files (PDF, images, ZIP, TXT, DOCX, PPTX) up to 50 MB
- View a dashboard with storage stats and recent uploads
- Browse, instantly search, download, and delete their files
- View a profile page with account stats

Everything is self-contained: files are stored on the local disk, metadata
lives in a local SQLite database, "notifications" are logged to the
console, and application logs are written to a local file.

---

## 2. Architecture

CloudVault follows a strict layered **MVC + Service Layer** architecture:

```
Routes → Controllers → Services → Repositories → Database / Local Storage
```

**The golden rule of this codebase:** controllers and business logic
*never* talk to SQLite or the filesystem directly. They only ever call
into one of four **service interfaces**:

| Interface             | Local implementation (today)     | AWS implementation (future) |
|------------------------|-----------------------------------|------------------------------|
| `StorageService`       | `LocalStorageService` (disk)      | `S3StorageService`           |
| `MetadataService`      | `SQLiteMetadataService`           | `DynamoDBMetadataService`    |
| `NotificationService`  | `ConsoleNotificationService`      | `SNSNotificationService`     |
| `LoggingService`       | `FileLoggingService`              | `CloudWatchLoggingService`   |

All four interfaces are defined as abstract base classes (methods throw
"must be implemented by subclass" if not overridden), so every concrete
implementation is guaranteed to expose the exact same method signatures.

A single file, `services/serviceFactory.js`, decides which concrete
implementation to instantiate based on `config/constants.js#PROVIDERS`
(which reads `STORAGE_PROVIDER`, `METADATA_PROVIDER`,
`NOTIFICATION_PROVIDER`, and `LOGGING_PROVIDER` environment variables).
Controllers import `services/serviceFactory.js` and never `require()` a
concrete implementation directly.

### Why this matters

Because controllers only depend on the *interface*, not the
*implementation*, you can migrate one piece of the stack to AWS at a time
without touching routes, controllers, middleware, or views. See
**Section 8 (Future AWS Migration Plan)** below.

---

## 3. Folder Structure

```
CloudVault/
  server.js                  Application entry point
  package.json
  .env.example                Copy to .env to customize config
  config/
    constants.js              Central config + provider switches
    database.js                SQLite connection + schema creation
  controllers/
    authController.js          Register / login / logout
    fileController.js          Upload / download / delete / search / dashboard
    userController.js          Profile page
  middleware/
    authMiddleware.js          Route protection (requireAuth)
    uploadMiddleware.js        Multer config (memory storage, validation)
    errorMiddleware.js         404 + centralized error handling
  models/
    User.js                    Plain data model for a user
    File.js                    Plain data model for a file
  repositories/                ONLY files allowed to run raw SQL
    userRepository.js
    fileRepository.js
  services/
    serviceFactory.js          ⭐ Wires interfaces to concrete implementations
    storage/
      StorageService.js         Abstract interface
      LocalStorageService.js    Local disk implementation
    metadata/
      MetadataService.js        Abstract interface
      SQLiteMetadataService.js  SQLite implementation
    notification/
      NotificationService.js    Abstract interface
      ConsoleNotificationService.js
    logging/
      LoggingService.js         Abstract interface
      FileLoggingService.js
  routes/
    index.js, authRoutes.js, fileRoutes.js, userRoutes.js
  views/                       EJS templates (Bootstrap 5, glassmorphism UI)
  public/
    css/style.css               Design tokens + component styles
    js/                          theme.js, dashboard.js, filesPage.js
  database/                    cloudvault.db is created here at runtime
  uploads/                     Uploaded file bytes are stored here at runtime
  logs/                        application.log is written here at runtime
  utils/
    validators.js, helpers.js
```

---

## 4. Installation

**Requirements:** Node.js **22.5+** (uses the built-in `node:sqlite` module, so no native/C++ build toolchain is required anywhere in this project)

```bash
cd CloudVault
npm install
npm start
```

Then open **http://localhost:3000** in your browser. The SQLite database
and its tables are created automatically on first run — no manual setup
required.

Optionally, copy `.env.example` to `.env` to customize the port, session
secret, or provider switches:

```bash
cp .env.example .env
```

---

## 5. Dependencies

| Package            | Purpose                                    |
|---------------------|---------------------------------------------|
| `express`            | Web framework / routing                     |
| `ejs`                | Server-rendered view templates              |
| `express-session`    | Session-based authentication                |
| `bcryptjs`            | Password hashing (pure JS, no native build)  |
| `multer`             | Multipart/form-data file upload parsing     |
| `node:sqlite`         | Built into Node 22.5+ — no native compile   |
| `dotenv`             | Loads `.env` into `process.env`             |

Frontend: Bootstrap 5, Bootstrap Icons, and vanilla JavaScript (all loaded
via CDN in `views/partials/head.ejs`, plus local CSS/JS in `public/`).

---

## 6. How Authentication Works

1. On **registration**, `authController.register` validates the form,
   checks for a duplicate email via `MetadataService.getUserByEmail()`,
   hashes the password with **bcryptjs** (10 salt rounds), and persists the
   new user via `MetadataService.createUser()`. The user is then
   auto-logged-in.
2. On **login**, the submitted password is compared against the stored
   hash with `bcrypt.compare()` (bcryptjs). On success, `req.session.userId` and
   `req.session.user` are set.
3. `express-session` issues an HTTP-only cookie (7-day expiry, i.e.
   "remember logged-in user"). No plaintext password is ever stored or
   logged.
4. `middleware/authMiddleware.js#requireAuth` protects the dashboard,
   files, profile, and upload/download/delete routes — unauthenticated
   requests are redirected to `/login`.
5. **Logout** destroys the session server-side.

---

## 7. How Uploads Work

1. The upload form (`enctype="multipart/form-data"`) posts to
   `POST /files/upload`.
2. `middleware/uploadMiddleware.js` configures **multer** with
   **in-memory storage** (not disk storage) and validates file type
   (extension + MIME allow-list) and size (50 MB limit) *before* the
   controller ever runs.
3. `fileController.uploadFile`:
   - Generates a unique, collision-proof filename (timestamp + random hex).
   - Calls `StorageService.upload(file, uniqueName)` to persist the raw
     bytes (today: written to `uploads/`; tomorrow: an S3 `PutObject`).
   - Calls `MetadataService.saveMetadata(...)` to persist the file record
     (today: an SQLite `INSERT`; tomorrow: a DynamoDB `PutItem`).
   - Calls `NotificationService.sendUploadNotification(...)` (today: a
     console log; tomorrow: an SNS `Publish`).
   - Calls `LoggingService.info(...)` to write an audit trail entry.
4. Buffering uploads in memory (rather than writing to a temp path on
   disk first) means the exact same code path can hand the buffer to an
   S3 client later — no rewrite of the upload flow is needed.

Downloads and deletes follow the identical pattern: Storage → Metadata →
Notification → Logging, all through the service interfaces.

---

## 8. Future AWS Migration Plan

To move CloudVault to AWS, you only need to touch the four service
implementation files (plus install the AWS SDK and configure credentials).
**Routes, controllers, middleware, models, repositories, and views stay
exactly as they are.**

| Step | What to do |
|------|------------|
| 1 | `npm install @aws-sdk/client-s3` and create `services/storage/S3StorageService.js` implementing `StorageService`'s `upload/download/delete/getFile/listFiles` methods using `PutObjectCommand`, `GetObjectCommand`, `DeleteObjectCommand`, and `ListObjectsV2Command`. |
| 2 | `npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb` and create `services/metadata/DynamoDBMetadataService.js` implementing `MetadataService`'s methods using `PutCommand`, `GetCommand`, `QueryCommand`, `DeleteCommand`, and `UpdateCommand`. |
| 3 | `npm install @aws-sdk/client-sns` and create `services/notification/SNSNotificationService.js` implementing `NotificationService`'s three `send*Notification` methods using `PublishCommand`. |
| 4 | `npm install @aws-sdk/client-cloudwatch-logs` and create `services/logging/CloudWatchLoggingService.js` implementing `LoggingService`'s `info/warning/error` methods using `PutLogEventsCommand`. |
| 5 | Uncomment the corresponding `require()` and `case` branch for each new class in `services/serviceFactory.js`. |
| 6 | Flip the relevant environment variable(s) in `.env`: `STORAGE_PROVIDER=s3`, `METADATA_PROVIDER=dynamodb`, `NOTIFICATION_PROVIDER=sns`, `LOGGING_PROVIDER=cloudwatch`. |
| 7 | Add your AWS credentials/region to `.env` (e.g. `AWS_REGION`, bucket name, table name, topic ARN, log group) and read them in the new service classes. |

You can migrate incrementally — e.g. move only `StorageService` to S3
first while `MetadataService` stays on SQLite — because each interface is
swapped independently.

---

## 9. Security Notes

- Passwords are hashed with **bcryptjs** (never stored or logged in plaintext).
- All routes that touch user data are protected by session-based
  `requireAuth` middleware.
- Every file/download/delete operation verifies the requesting user
  actually owns the file (`fileRecord.userId === session.userId`) before
  acting — this prevents one user from accessing another user's files by
  guessing IDs.
- Uploaded filenames are never trusted for filesystem paths — a unique,
  server-generated name is used, and `LocalStorageService` also strips any
  path segments (`path.basename`) as defense-in-depth against path
  traversal.
- All SQL is parameterized via `node:sqlite` prepared statements (no
  string concatenation), preventing SQL injection.
- EJS auto-escapes interpolated output (`<%= %>`) by default, mitigating
  reflected/stored XSS in filenames, names, and emails rendered in views.
- File type is validated both by MIME type and extension, and file size is
  capped at 50 MB by multer before the request body is fully read.

---

## 10. Screenshots

_Add screenshots of the login page, dashboard, files table, and upload
modal here once you've run the app locally._

```
docs/screenshots/login.png
docs/screenshots/dashboard.png
docs/screenshots/files.png
docs/screenshots/upload-modal.png
```

---

## 11. License

MIT — do whatever you like with this project.
