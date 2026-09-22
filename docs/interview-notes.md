# Technical Interview Architecture Guide & Deep-Dive Q&A

This document provides senior software architect-level answers to 18 critical technical interview questions evaluated during system design and architecture reviews for CineBook AI.

---

### Q1: How do you prevent double-booking under high concurrency?
**Answer:**
Double-booking is prevented using a defense-in-depth approach combining **pessimistic row-level locking** (`SELECT ... FOR UPDATE`), **deterministic resource ordering**, and **atomic state transitions**:
1. **Pessimistic Row-Level Lock**: When a user selects a batch of seats, the API opens a database transaction and issues:
   ```sql
   SELECT * FROM show_seats 
   WHERE id IN (:seat_ids) 
   FOR UPDATE;
   ```
   This places an exclusive write lock on the matching database rows in PostgreSQL/SQLite. Any concurrent transaction attempting to lock or read these seats for mutation blocks until the first transaction commits or aborts.
2. **Deterministic Sorting to Prevent Deadlocks**: If User A requests seats `[101, 102]` and User B concurrently requests `[102, 101]`, a circular wait deadlock could occur. CineBook AI deterministically sorts seat IDs (`sorted(seat_ids)`) in memory prior to acquiring locks, ensuring a uniform global lock acquisition hierarchy across all transactions.
3. **Atomic Verification**: Inside the locked transaction, the service validates that every requested seat has `status == 'AVAILABLE'` (or has an expired lock: `status == 'LOCKED' AND locked_until < NOW()`). If valid, the seats are updated to `status = 'LOCKED'`, `locked_until = NOW() + 5 minutes`, and committed. If any single seat is unavailable, the entire transaction rolls back (`ROLLBACK`) and returns `409 Conflict`.
*Code Reference:* `backend/app/services/seat_service.py` -> `lock_seats()`

---

### Q2: Why did you choose row-level locking vs Redis distributed locks (Redlock)?
**Answer:**
We evaluated both strategies against the CAP theorem and operational failure modes:
- **Why Row-Level DB Locking was Chosen for Core Inventory**:
  - **ACID Transaction Boundary**: The seat state transition (`AVAILABLE` $\to$ `LOCKED` $\to$ `BOOKED`) and the creation of the associated `Booking` and `BookingItem` records must happen inside an atomic database transaction. If we used Redis distributed locks, we would have two distinct systems (Redis and PostgreSQL). A network partition or crash between the Redis lock acquisition and the DB commit introduces a distributed transaction problem requiring two-phase commit (2PC) or compensating transactions (Saga pattern).
  - **Single Source of Truth**: The relational database is the immutable ledger of truth. A lock acquired directly on the row guarantees that no rogue process or bypass script can mutate the seat.
- **When Redis Distributed Lock (Redlock) is Appropriate**:
  - At massive scale (>50,000 requests/sec for a viral blockbuster like *Avengers*), pounding the relational database with concurrent lock attempts causes DB connection pool exhaustion.
  - In our scale-up roadmap (see Q5), Redis is used as an **upstream gatekeeper / rate limiter** using Redis `SET resource_name my_random_value NX PX 300000` (Lua script). If the Redis lock fails, the request is rejected in memory at the edge in sub-millisecond time, protecting the DB from overload. Once Redis grants the lock, the backend executes the definitive DB transaction.

---

### Q3: How does the 5-minute seat locking TTL work?
**Answer:**
1. **Timestamp Storage**: When seats are locked, the column `locked_until` is set to `datetime.now(timezone.utc) + timedelta(minutes=5)` and `status = 'LOCKED'`.
2. **Just-In-Time Evaluation**: When any customer requests the seat matrix (`GET /shows/{id}/seats`), or when another user attempts to lock a seat (`POST /seats/lock`), the system checks:
   ```python
   if seat.status == SeatStatus.LOCKED:
       if is_past(seat.locked_until):
           # Lock has expired! Reclaim seat atomically
           seat.status = SeatStatus.AVAILABLE
           seat.locked_by_user_id = None
           seat.locked_until = None
   ```
   This lazy-evaluation strategy guarantees 100% accurate status without relying on cron jobs.
3. **Background Cleanup Worker**: A scheduled task running every 60 seconds sweeps and releases all expired seats across the database, preventing stale records from occupying memory.
*Code Reference:* `backend/app/services/seat_service.py` -> `get_show_seats()` and `lock_seats()`

---

### Q4: How do you handle network drops during payment processing?
**Answer:**
Network drops between Client, Backend, and Payment Gateway can occur at three failure points:
1. **Client Disconnects after Payment Authorization**: The customer's mobile browser loses internet after OTP entry.
   - *Resolution*: The payment gateway issues an asynchronous server-to-server webhook callback to our backend (`POST /api/v1/payments/paytm/callback`). Because the callback travels directly between Paytm and FastAPI servers, the booking confirms successfully regardless of client connection status. When the user reconnects, their ticket is already in `My Bookings`.
2. **Webhook Callback Dropped or Delayed**:
   - *Resolution*: An idempotent background reconciliation poller runs every 2 minutes for all payments in `PENDING` status for more than 3 minutes. It queries the Paytm Order Status API (`GET /v1/order/status`), verifies transaction settlement status, and reconciles the booking.
3. **Client Retries Payment (Idempotency)**:
   - *Resolution*: Every payment record has a unique `order_id`. If a user double-clicks 'Pay Now', the backend checks if an order is already active for this `booking_id` and rejects duplicate charges.

---

### Q5: How would you scale this platform to 100,000 requests/sec?
**Answer:**
Scaling from 1,000 req/s to 100,000 req/s requires decoupling read throughput from write throughput:
1. **Global CDN Edge Caching (Cloudflare / Fastly)**:
   - 95% of traffic is browsing movie details, posters, trailers, and showtimes.
   - Cache movie catalog endpoints (`GET /movies`, `GET /movies/{id}`) at the edge with a 60-second TTL and cache-tags for instant purge upon admin edits.
2. **Database Read Replicas**:
   - Master PostgreSQL node handles writes and row-level locks.
   - 4-6 Read Replicas serve read queries (`GET /shows`, `GET /theatres`, `GET /reviews`) using connection pooling with PgBouncer.
3. **Redis In-Memory Seat Matrix**:
   - Store auditorium seat states in Redis Bitmaps or HashSets (`HSET show:101:seats seat_12 0`).
   - Atomic seat reservation executed via Lua script in Redis memory in <1ms.
4. **Asynchronous Message Queue for Booking Finalization**:
   - Push completed payments to Apache Kafka or RabbitMQ.
   - Workers consume events asynchronously to generate QR codes, send emails/SMS, and update analytical aggregates without blocking the user response.

---

### Q6: How does the hybrid recommendation model handle the cold-start problem?
**Answer:**
Cold start manifests in two ways:
1. **Cold User (New User with 0 Bookings)**:
   - The user has no row in the collaborative filtering interaction matrix.
   - *Solution*: The hybrid engine detects $|H_u| == 0$ and activates the **Popularity & Quality Fallback Model**:
     $$\text{Score} = \text{Rating} \times \log(1 + \text{Vote Count}) \times \text{Trending Multiplier}$$
   - As soon as the user browses a movie or books 1 ticket, the content-based TF-IDF model immediately vectors against that movie's metadata to personalize subsequent recommendations.
2. **Cold Item (Newly Released Movie with 0 Bookings)**:
   - A newly added movie has zero collaborative filtering co-occurrence data.
   - *Solution*: Because content-based TF-IDF vectors are extracted directly from plot keywords, cast, and genres during catalog creation, the model can recommend the new movie instantly based on textual similarity to established blockbusters.

---

### Q7: Explain your database schema design decisions.
**Answer:**
1. **Why `ShowSeat` is an independent model from `Seat`**:
   - A multiplex has physical seats that do not change (Screen 1 Row A Seat 1). However, that seat is sold 5 times a day for different shows. Decoupling physical `Seat` from `ShowSeat` allows each show to maintain its own independent booking status, lock TTL, and dynamic price tier without mutating the physical blueprint.
2. **Why `BookingItem` snapshots price at time of purchase**:
   - Dynamic pricing or weekend surcharges mean a seat sold on Friday might cost ₹300, but on Monday costs ₹200. Snapshotting `price` in `BookingItem` guarantees historical tax and accounting immutability.
3. **Normalized Many-to-Many for Genres and Languages**:
   - Enables multi-faceted filtering (`/movies?genre=Action&genre=Sci-Fi&language=Hindi`) using standard relational joins without slow `LIKE '%Action%'` wildcard queries on text columns.

---

### Q8: How do you ensure price calculation integrity?
**Answer:**
- **Zero Frontend Trust**: The frontend sends only `show_id`, `seat_ids`, and optional `coupon_code`. Any price, discount, or tax amount submitted by the client is completely ignored and discarded.
- **Backend Single Source of Truth**:
  1. Base price is fetched from `shows.base_price`.
  2. Multiplier is fetched from `seats.tier` enum (VIP = $1.8\times$, PREMIUM = $1.3\times$, STANDARD = $1.0\times$).
  3. Coupon discount is validated against minimum order thresholds in `coupons` table.
  4. Platform convenience fee (5%) and Indian GST (18% on convenience fee) are computed with strict floating-point/decimal precision.
  5. The final total is verified before issuing the gateway payment order.

---

### Q9: How would you implement dynamic pricing?
**Answer:**
Dynamic pricing in modern cinema platforms adjusts prices based on **occupancy velocity**, **time-to-show**, and **day-of-week**:
$$\text{Price}(t) = \text{Base Price} \times M_{\text{day}} \times M_{\text{time}} \times M_{\text{velocity}}$$
- **Occupancy Velocity Multiplier**:
  - $<30\%$ booked: $0.9\times$ (early-bird discount)
  - $30\% - 70\%$ booked: $1.0\times$ (standard)
  - $>70\%$ booked: $1.25\times$ (high-demand surge)
  - $>90\%$ booked: $1.4\times$ (last-few-seats premium)
- **Time Decay Multiplier**: Prime-time (Friday/Saturday evening) incurs a $1.2\times$ multiplier; weekday matinees incur $0.85\times$.
- **Implementation**: Executed in `ShowService.calculate_current_seat_price()` before returning seat availability. Once locked, the price is frozen for the 5-minute TTL window to prevent pricing volatility during checkout.

---

### Q10: How do you handle database failover and read replicas?
**Answer:**
1. **High-Availability Topology**:
   - Primary (Master) PostgreSQL instance with synchronous replication to a Hot Standby in a secondary Availability Zone (AZ).
   - Asynchronous read replicas in tertiary AZs.
2. **Automated Failover (Patroni / AWS Aurora Multi-AZ)**:
   - Distributed consensus using etcd or Raft.
   - If the primary node misses heartbeats for 10 seconds, Patroni automatically promotes the Hot Standby to Primary.
   - Virtual IP / DNS endpoint switches seamlessly; backend DB connection pools re-establish connections using `pool_pre_ping=True`.
3. **Read/Write Splitting**:
   - FastAPI dependency injection provides two database sessions: `get_write_db()` pointing to Primary, and `get_read_db()` pointing to the Read Replica pool.

---

### Q11: What caching strategy would you implement and why?
**Answer:**
We implement a multi-tiered **Cache-Aside (Lazy Loading)** strategy with **Write-Through Invalidation**:
1. **L1 Application Memory Cache**: Python `cachetools.TTLCache` for static taxonomies (Cities, Genres, Languages) with a 1-hour TTL.
2. **L2 Distributed Redis Cache**:
   - Key: `shows:{id}:seatmap` (TTL: 2 seconds) — caches seat availability maps to absorb intense browsing bursts.
   - Key: `movie:{id}:details` (TTL: 10 minutes).
3. **Invalidation Policy**:
   - When a booking is confirmed, the specific `shows:{id}:seatmap` cache key is purged immediately.
   - Cache misses query the DB, repopulate Redis, and return.

---

### Q12: How would you handle seat selection for a 10,000-seat stadium vs 150-seat cinema?
**Answer:**
| Parameter | 150-Seat Cinema Auditorium | 10,000-Seat Stadium / Arena |
| :--- | :--- | :--- |
| **Data Payload** | Full JSON seat matrix (~15 KB) sent to client. | Hierarchical drill-down: Section $\to$ Stand $\to$ Bay $\to$ Row. Client never loads 10,000 nodes at once. |
| **Rendering** | DOM / SVG canvas rendering all seats interactively. | HTML5 WebGL / Canvas rendering (e.g. PixiJS or Three.js) with spatial level-of-detail (LOD). |
| **Locking Strategy** | Row-level locking on individual seat IDs. | **General Admission / Block Allocation**: User requests "2 tickets in West Stand Tier 1". An atomic counter decrements (`DECRBY stand:west:tier1:avail 2`). Specific seat assignment happens post-purchase. |

---

### Q13: How does your authentication and authorization system work?
**Answer:**
1. **Password Security**: Passwords hashed using standard `bcrypt` with salt and an adaptive work factor (12 rounds), truncated safely at 72 bytes.
2. **Token Generation**: Stateless JSON Web Tokens (JWT) signed with `HS256` containing `sub` (user_id), `email`, `role`, and `exp` (1440 minutes).
3. **Role-Based Access Control (RBAC)**:
   - Implemented via FastAPI dependency injection:
     - `get_current_user`: Verifies Bearer token and checks `is_active == True`.
     - `get_current_admin`: Chains on `get_current_user` and enforces `user.role == "ADMIN"`, raising `403 Forbidden` if breached.
4. **Context Isolation**: Standard customers can only access their own bookings (`WHERE user_id == current_user.id`), whereas admins access the platform ledger.

---

### Q14: How would you handle multi-region deployments?
**Answer:**
For global or pan-continental operations:
1. **Latency Routing**: Route 53 Geoproximity routing directs Indian users to `ap-south-1` (Mumbai), US users to `us-east-1` (N. Virginia).
2. **Regional Cinema Sharding**:
   - Theatres in Mumbai and theatres in New York have zero inventory overlap.
   - Data can be partitioned cleanly by `city_id` / region. Write transactions for Indian theatres execute strictly in `ap-south-1`, eliminating cross-region latency for row-level locking.
3. **Global User Directory**: CockroachDB or AWS Aurora Global Database replicates global user profiles and login credentials across regions.

---

### Q15: Explain your database migration strategy for zero-downtime deploys.
**Answer:**
We follow the **Expand and Contract (Parallel Run)** database migration pattern:
1. **Step 1 (Expand)**: Add new columns or tables as nullable or with defaults (e.g., `ALTER TABLE bookings ADD COLUMN qr_code_token VARCHAR(255) NULL;`). Apply via `alembic upgrade head`. Existing application code continues running uninterrupted.
2. **Step 2 (Deploy Code)**: Deploy new backend version that writes to both old and new columns.
3. **Step 3 (Backfill)**: Run an asynchronous script to backfill data for legacy records.
4. **Step 4 (Contract)**: Once all traffic is routed to the new code, apply a final migration adding `NOT NULL` constraints and dropping obsolete columns.

---

### Q16: How do you monitor and alert on payment failures?
**Answer:**
1. **Metrics Collection (Prometheus / StatsD)**:
   - Increment counters: `payments_initiated_total`, `payments_success_total`, `payments_failed_total{reason="insufficient_funds"}`.
2. **Golden Signals Dashboard (Grafana)**:
   - Real-time gauge: **Payment Success Rate (SR)** over a 5-minute rolling window.
3. **Automated Alerting (PagerDuty / Slack)**:
   - Alert Rule: If `payment_success_rate < 85%` for 3 consecutive minutes, trigger High-Severity Alert (indicates payment gateway outage).
   - The application automatically flips payment traffic to a secondary standby gateway (e.g. Razorpay / BillDesk) via dynamic gateway routing rules.

---

### Q17: How would you implement real-time seat status updates (WebSockets/SSE)?
**Answer:**
In the current implementation, client polling occurs at checkout. For real-time updates:
1. **Server-Sent Events (SSE) or WebSockets**:
   - When a user opens `/shows/101/seats`, a WebSocket connection opens to `/ws/shows/101`.
2. **Redis Pub/Sub Backbone**:
   - When any user locks seat `[45, 46]`, `SeatService` publishes an event to Redis channel `show:101:events`:
     ```json
     {"event": "SEATS_LOCKED", "seat_ids": [45, 46], "locked_until": "2026-09-22T14:30:00Z"}
     ```
   - All backend nodes subscribed to `show:101:events` broadcast the message down their connected WebSockets.
   - Connected browser canvases update seat colors in real time without refreshing the page.

---

### Q18: What would you do differently if building this for 10 million daily active users?
**Answer:**
At 10M DAU:
1. **Microservices Decomposition**:
   - Split monolith into targeted microservices: *Identity & Auth Service*, *Catalog & Search Service*, *Inventory & Reservation Service* (high write, strict locks), *Payment & Invoicing Service*, and *ML Recommendation Service*.
2. **Event-Driven Architecture (Event Sourcing)**:
   - Transition seat inventory to Event Sourcing using Kafka. Every lock, unlock, and booking is an immutable event in a log, providing an audit trail and replayability.
3. **Distributed Search (Elasticsearch / OpenSearch)**:
   - Offload movie and theatre text searches to Elasticsearch for sub-millisecond autocomplete and fuzzy typo tolerance.
4. **Dedicated ML Feature Store & GPU Inference**:
   - Deploy Feast Feature Store with real-time vector search (Milvus / Pinecone / pgvector) for deep-learning two-tower neural recommendation models (user embeddings $\times$ movie embeddings).
