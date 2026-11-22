
# HoneyChain API Documentation

## 1. Overview

HoneyChain provides a RESTful API for managing beehives, tracking honey batches, authenticating users, and verifying honey traceability records through the blockchain.

### Base URLs

**Production:**
```text
https://honeychain-kram.onrender.com/api
```

**Local development:**
```text
http://localhost:5000/api
```

### API Response Format

API responses use JSON.

Successful responses generally contain:
- `success`: Indicates whether the request succeeded.
- `message`: Descriptive response message, when applicable.
- `data`: Requested or created resource, when applicable.

Failed responses contain:
- `success: false`
- `message`: Error description.

---

## 2. Authentication

HoneyChain uses JSON Web Tokens (JWT) for authentication.

### Authentication Header

Protected endpoints require the following HTTP header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Features

- Password hashing using bcrypt with 12 salt rounds.
- JWT authentication using HS256.
- Default token expiry: 1 day.
- Public registration assigns the `beekeeper` role.
- Deactivated accounts cannot authenticate.
- Protected routes verify the user's account before allowing access.

### User Roles

| Role | Description |
|---|---|
| beekeeper | Default role assigned during registration |
| admin | Administrative role defined in the user model |

---

## 3. Authentication Endpoints

Base path: `/auth`

### 3.1 Register User

**Endpoint:** `POST /auth/register`

**Access:** Public

Creates a new beekeeper account.

**Request Body:**

```json
{
  "name": "Om Singh",
  "email": "om@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**

- Name is required and cannot exceed 80 characters.
- Email must be valid and cannot exceed 254 characters.
- Email is normalized to lowercase.
- Password must contain at least 8 characters.
- Password cannot exceed 72 UTF-8 bytes.
- Duplicate email addresses are not allowed.
- The role is automatically assigned as `beekeeper`.

**Success Response:** `201 Created`

```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "Om Singh",
    "email": "om@example.com",
    "role": "beekeeper"
  }
}
```

**Possible Errors:**
- `400` – Invalid or missing input.
- `409` – Email already registered.
- `500` – Authentication error.

**Rate Limit:** 5 registration attempts per hour.

### 3.2 Login User

**Endpoint:** `POST /auth/login`

**Access:** Public

Authenticates a registered user and returns a JWT.

**Request Body:**

```json
{
  "email": "om@example.com",
  "password": "securePassword123"
}
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful.",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "Om Singh",
    "email": "om@example.com",
    "role": "beekeeper"
  }
}
```

**Possible Errors:**
- `400` – Missing email or password.
- `401` – Invalid email or password.
- `403` – Account has been deactivated.
- `500` – Authentication error.

**Rate Limit:** 5 login attempts per 15 minutes.

### 3.3 Get Current User

**Endpoint:** `GET /auth/me`

**Access:** Protected

Returns the currently authenticated user's information.

**Headers:**

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response:** `200 OK`

```json
{
  "success": true,
  "user": {
    "id": "USER_ID",
    "name": "Om Singh",
    "email": "om@example.com",
    "role": "beekeeper"
  }
}
```

---

## 4. Hive Management Endpoints

Base path: `/hives`

All hive endpoints require authentication.

### 4.1 Create Hive

**Endpoint:** `POST /hives`

Creates a new beehive associated with the authenticated beekeeper.

**Request Body:**

```json
{
  "hiveId": "HIVE-001",
  "name": "North Garden Hive",
  "location": "Bhopal, Madhya Pradesh",
  "beeType": "Indian Honey Bee",
  "status": "Healthy",
  "lastInspection": "2026-11-20",
  "notes": "Healthy and active colony."
}
```

**Required Fields:**
- `hiveId`
- `name`
- `location`

**Optional Fields:**
- `beeType`
- `status`
- `lastInspection`
- `notes`

**Allowed Bee Types:**
- Indian Honey Bee
- Italian Honey Bee
- Carniolan Honey Bee
- Other / Unknown

**Allowed Status Values:**
- Healthy
- Needs inspection
- Under observation

**Success Response:** `201 Created`

Returns the created hive inside the `data` property.

### 4.2 Get All Hives

**Endpoint:** `GET /hives`

Returns the authenticated beekeeper's active hives.

**Query Parameters:**

| Parameter | Description | Default |
|---|---|---|
| `search` | Searches hive ID, name, and location | Empty |
| `status` | Filters by hive status | All |
| `page` | Page number | 1 |
| `limit` | Records per page | 20 |

Maximum page limit: 100 records.

**Example:**

```http
GET /hives?search=North&status=Healthy&page=1&limit=10
```

**Success Response:** `200 OK`

Returns:
- `data`: Array of hives.
- `pagination`: Total records, current page, limit, and total pages.

### 4.3 Get Hive by ID

**Endpoint:** `GET /hives/:id`

Returns a specific hive belonging to the authenticated beekeeper.

**Example:**

```http
GET /hives/65f123456789abcdef123456
```

**Possible Errors:**
- `400` – Invalid MongoDB ID.
- `401` – Authentication required.
- `404` – Hive not found.

### 4.4 Update Hive

**Endpoint:** `PATCH /hives/:id`

Updates an existing hive.

**Allowed Request Fields:**

```json
{
  "name": "Updated Garden Hive",
  "location": "Central Apiary, Bhopal",
  "beeType": "Italian Honey Bee",
  "status": "Healthy",
  "lastInspection": "2026-11-22",
  "notes": "Inspection completed successfully."
}
```

Only the supported fields supplied in the request are updated.

**Possible Errors:**
- `400` – Invalid input or no valid fields.
- `404` – Hive not found.
- `409` – Duplicate hive ID.

### 4.5 Deactivate Hive

**Endpoint:** `DELETE /hives/:id`

Deactivates a hive using a soft-delete operation.

The record remains in the database, but its `isActive` field becomes `false`.

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Hive deactivated successfully."
}
```

---

## 5. Honey Batch Management Endpoints

Base path: `/batches`

All management endpoints require authentication, except the public trace endpoint.

### 5.1 Create Honey Batch

**Endpoint:** `POST /batches`

Creates a honey batch and attempts to record its data on the blockchain.

**Request Body:**

```json
{
  "batchId": "BATCH-001",
  "honeyType": "Organic Wildflower Honey",
  "sourceHive": "HIVE-001",
  "harvestDate": "2026-11-20",
  "quantityKg": 25,
  "apiaryLocation": "Bhopal, Madhya Pradesh",
  "notes": "Harvested from a healthy colony."
}
```

**Required Fields:**
- `batchId`
- `honeyType`
- `sourceHive`
- `harvestDate`
- `quantityKg`
- `apiaryLocation`

**Optional Fields:**
- `notes`

**Validation Rules:**
- Batch IDs must be unique.
- Batch IDs are stored in uppercase.
- Source hive must belong to the authenticated beekeeper and be active.
- Harvest date cannot be in the future.
- Quantity must be between 0.1 kg and 100,000 kg.
- APIary location cannot exceed 120 characters.

**Blockchain Integration:**

After saving the batch in MongoDB, the backend attempts to record it on the blockchain.

Two outcomes are possible:

1. Blockchain recording succeeds: blockchain status becomes `recorded`.
2. Blockchain recording fails: the batch remains saved in MongoDB with blockchain status `pending`.

**Success Response:** `201 Created`

The response includes:
- `success`
- `message`
- `blockchainStatus`
- `data`: Created and populated batch information.

### 5.2 Get All Honey Batches

**Endpoint:** `GET /batches`

Returns batches belonging to the authenticated beekeeper.

**Query Parameters:**

| Parameter | Description | Default |
|---|---|---|
| `search` | Searches batch ID, honey type, and apiary location | Empty |
| `status` | Filters by batch status | All |
| `page` | Page number | 1 |
| `limit` | Records per page | 20 |

Maximum page limit: 100 records.

**Allowed Filter Statuses:**
- Harvested
- Processing
- Packaged
- Verified

**Example:**

```http
GET /batches?status=Processing&page=1&limit=10
```

**Success Response:** `200 OK`

Returns:
- `data`: Array of honey batches.
- `pagination`: Total records, current page, limit, and total pages.

### 5.3 Get Batch by ID

**Endpoint:** `GET /batches/:id`

Returns a specific batch belonging to the authenticated beekeeper.

The source hive information is populated in the response.

**Possible Errors:**
- `400` – Invalid MongoDB ID.
- `404` – Batch not found.

### 5.4 Update Honey Batch

**Endpoint:** `PATCH /batches/:id`

Updates an existing batch.

**Allowed Request Fields:**

```json
{
  "honeyType": "Organic Forest Honey",
  "sourceHive": "HIVE-002",
  "harvestDate": "2026-11-20",
  "quantityKg": 30,
  "apiaryLocation": "Updated Apiary Location",
  "notes": "Updated batch information."
}
```

**Important Rules:**
- Only supported fields can be updated.
- Quantity must be a finite number greater than zero.
- Source hive must belong to the authenticated beekeeper and be active.
- A batch with an existing blockchain transaction hash cannot be modified.

**Possible Errors:**
- `400` – Invalid input.
- `404` – Batch not found.
- `409` – Batch is already recorded on the blockchain.

### 5.5 Update Batch Status

**Endpoint:** `PATCH /batches/:id/status`

Updates the lifecycle status of a honey batch.

**Request Body:**

```json
{
  "status": "Processing"
}
```

**Allowed Status Updates:**
- Harvested
- Processing
- Packaged

The `Verified` status is not accepted through this endpoint.

**Lifecycle Date Handling:**
- When status changes to `Processing`, `processingDate` is recorded.
- When status changes to `Packaged`, `packagingDate` is recorded.
- Status changes are stored in `statusHistory`.

**Success Response:** `200 OK`

Returns the updated batch and a descriptive message.

### 5.6 Retry Blockchain Recording

**Endpoint:** `POST /batches/:id/blockchain/retry`

Retries blockchain recording for an existing batch.

**Access:** Protected

**Request Body:** Not required.

**Behavior:**
- Checks that the batch belongs to the authenticated beekeeper.
- Checks whether a transaction hash already exists.
- Attempts blockchain recording if it has not already been recorded.
- Prevents simultaneous retry attempts for the same batch within the running server process.

**Success Response:** `200 OK`

Returns the blockchain status and batch data.

**Rate Limit:** 5 retry attempts per 15 minutes.

---

## 6. Public Honey Traceability

### 6.1 Trace Honey Batch

**Endpoint:** `GET /batches/trace/:batchId`

**Access:** Public

Allows consumers and other visitors to trace a honey batch without signing in.

**Example:**

```http
GET /batches/trace/BATCH-001
```

The batch ID is normalized by trimming whitespace and converting it to uppercase.

**Traceability Information:**

The endpoint returns:
- Batch ID
- Honey type
- Harvest date
- Quantity
- Current status
- Apiary location
- Processing date
- Packaging date
- Source hive information
- Blockchain network
- Smart contract address
- Blockchain transaction hash
- Data hash
- Blockchain recording timestamp
- Batch status history

**Lifecycle Stages:**

The response includes the following stages:

1. Honey Harvested
2. Processing
3. Packaging
4. Blockchain Verification

Each stage includes its completion status and relevant date or description.

**Blockchain Verification:**

The backend verifies the batch against the blockchain record and returns:
- `blockchainVerified`
- `verification`

**Privacy:**

The public trace response intentionally excludes:
- Internal MongoDB document IDs.
- Owner identifiers.
- Private batch notes.

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Traceability verification result.",
  "data": {
    "batch": {
      "batchId": "BATCH-001",
      "honeyType": "Organic Wildflower Honey",
      "harvestDate": "2026-11-20",
      "quantityKg": 25,
      "status": "Packaged",
      "apiaryLocation": "Bhopal, Madhya Pradesh",
      "processingDate": "2026-11-21",
      "packagingDate": "2026-11-22",
      "sourceHive": {
        "hiveId": "HIVE-001",
        "name": "North Garden Hive",
        "location": "Bhopal, Madhya Pradesh",
        "beeType": "Indian Honey Bee"
      },
      "blockchain": {
        "network": "Ethereum Sepolia",
        "contractAddress": "CONTRACT_ADDRESS",
        "transactionHash": "TRANSACTION_HASH",
        "dataHash": "DATA_HASH",
        "recordedAt": "2026-11-20T10:00:00.000Z"
      },
      "statusHistory": []
    },
    "stages": [],
    "blockchainVerified": true,
    "verification": {}
  }
}
```

The values above illustrate the response structure; actual values depend on the requested batch and verification result.

**Possible Errors:**
- `400` – Invalid batch ID.
- `404` – Batch not found.
- `500` – Unable to trace the batch.

**Rate Limit:** 60 requests per 15 minutes.

---

## 7. System and Health Endpoints

### 7.1 API Root

**Endpoint:** `GET /`

Returns basic information about the running API.

**Access:** Public

**Response:**

```json
{
  "success": true,
  "message": "HoneyChain API is running",
  "version": "1.0.0"
}
```

### 7.2 Health Check

**Endpoint:** `GET /api/health`

**Access:** Public

Checks whether the API and MongoDB database are operational.

**Healthy Response:** `200 OK`

```json
{
  "success": true,
  "service": "HoneyChain API",
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-11-22T10:00:00.000Z"
}
```

**Unhealthy Response:** `503 Service Unavailable`

Indicates that the database is disconnected.

---

## 8. HTTP Status Codes

| Status Code | Meaning |
|---|---|
| 200 | Request completed successfully |
| 201 | Resource created successfully |
| 400 | Invalid request or validation error |
| 401 | Authentication required or invalid token |
| 403 | Access forbidden or origin not allowed |
| 404 | Requested resource or route not found |
| 409 | Duplicate resource or conflicting operation |
| 500 | Internal server error |
| 503 | Database service unavailable |

---

## 9. Security and API Protection

HoneyChain implements several API security measures:

- **Helmet:** Adds security-related HTTP headers.
- **CORS:** Restricts browser requests to configured frontend origins.
- **JWT:** Protects private API endpoints.
- **bcrypt:** Hashes user passwords before database storage.
- **Rate Limiting:** Restricts repeated authentication, traceability, and blockchain retry requests.
- **Ownership Checks:** Restricts hive and batch management to their respective owners.
- **Input Validation:** Validates request data before database operations.
- **Environment Variables:** Keeps sensitive configuration such as JWT secrets and blockchain credentials outside source code.
- **Request Size Limit:** JSON request bodies are limited to 1 MB.

### CORS Configuration

In production, the backend accepts browser requests from the configured `CLIENT_URL`.

During local development, the allowed frontend origins are:

```text
http://localhost:5173
http://127.0.0.1:5173
```

---

## 10. API Route Summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register account |
| POST | `/auth/login` | Public | Authenticate user |
| GET | `/auth/me` | Protected | Get current user |
| POST | `/hives` | Protected | Create hive |
| GET | `/hives` | Protected | Get all hives |
| GET | `/hives/:id` | Protected | Get hive details |
| PATCH | `/hives/:id` | Protected | Update hive |
| DELETE | `/hives/:id` | Protected | Deactivate hive |
| POST | `/batches` | Protected | Create honey batch |
| GET | `/batches` | Protected | Get all batches |
| GET | `/batches/:id` | Protected | Get batch details |
| PATCH | `/batches/:id` | Protected | Update batch |
| PATCH | `/batches/:id/status` | Protected | Update batch status |
| POST | `/batches/:id/blockchain/retry` | Protected | Retry blockchain recording |
| GET | `/batches/trace/:batchId` | Public | Trace honey batch |
| GET | `/` | Public | API information |
| GET | `/api/health` | Public | Check API and database health |

---

## 11. Testing the API

The HoneyChain API can be tested using Postman or any HTTP client.

Recommended testing sequence:

1. Register a beekeeper account.
2. Log in and copy the JWT token.
3. Include the token in the Authorization header.
4. Create a hive.
5. Create a honey batch using the hive ID.
6. Update the batch lifecycle status.
7. Check the blockchain recording status.
8. Open the public traceability endpoint.
9. Verify the batch information and blockchain record.

**Production API Base URL:**

```text
https://honeychain-kram.onrender.com/api
```

**Project Repository:**

https://github.com/omsingh-blip/HoneyChain

**Frontend Application:**

https://honeychainapito.netlify.app
