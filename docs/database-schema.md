# Database Schema & Entity Relationships

CineBook AI utilizes a 24-table relational database architecture designed for third normal form (3NF) compliance, transactional integrity, and low-latency query performance.

---

## Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    ROLES ||--o{ USERS : assigns
    USERS ||--o{ BOOKINGS : places
    USERS ||--o{ PAYMENTS : makes
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ RATINGS : submits
    USERS ||--o{ FAVORITES : saves
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : triggers
    USERS ||--o{ COUPON_USAGES : redeems

    CITIES ||--o{ THEATRES : contains
    THEATRES ||--o{ SCREENS : houses
    SCREENS ||--o{ SEATS : configures
    SCREENS ||--o{ SHOWS : schedules

    MOVIES ||--o{ SHOWS : features
    MOVIES ||--o{ MOVIE_GENRES : categorized
    GENRES ||--o{ MOVIE_GENRES : belongs
    MOVIES ||--o{ MOVIE_LANGUAGES : speaks
    LANGUAGES ||--o{ MOVIE_LANGUAGES : belongs
    MOVIES ||--o{ REVIEWS : receives
    MOVIES ||--o{ RATINGS : receives

    SHOWS ||--o{ SHOW_SEATS : allocates
    SEATS ||--o{ SHOW_SEATS : instances

    BOOKINGS ||--o{ BOOKING_ITEMS : contains
    SHOW_SEATS ||--o| BOOKING_ITEMS : references
    BOOKINGS ||--o{ PAYMENTS : settles
    COUPONS ||--o{ COUPON_USAGES : tracks

    USERS {
        int id PK
        string email UK
        string password_hash
        string full_name
        string phone
        int role_id FK
        boolean is_active
        datetime created_at
    }

    MOVIES {
        int id PK
        string title
        string slug UK
        text description
        int duration_minutes
        date release_date
        string poster_url
        float rating
        int vote_count
        boolean is_trending
        boolean is_active
    }

    THEATRES {
        int id PK
        string name
        int city_id FK
        text address
        string phone
        boolean is_active
    }

    SCREENS {
        int id PK
        int theatre_id FK
        int screen_number
        string name
        string screen_type
        int total_seats
    }

    SEATS {
        int id PK
        int screen_id FK
        string row
        int seat_number
        enum tier "STANDARD, PREMIUM, VIP"
        boolean is_active
    }

    SHOWS {
        int id PK
        int movie_id FK
        int theatre_id FK
        int screen_id FK
        datetime start_time
        datetime end_time
        float base_price
        string format
        string language
        boolean is_active
    }

    SHOW_SEATS {
        int id PK
        int show_id FK
        int seat_id FK
        float price
        enum status "AVAILABLE, LOCKED, BOOKED"
        int locked_by_user_id FK
        datetime locked_until
        int version
    }

    BOOKINGS {
        int id PK
        string booking_reference UK
        int user_id FK
        int show_id FK
        float total_amount
        float discount_amount
        float convenience_fee
        float tax_amount
        float final_amount
        enum status "PENDING, CONFIRMED, CANCELLED, EXPIRED"
        string qr_code_token
        datetime created_at
    }

    BOOKING_ITEMS {
        int id PK
        int booking_id FK
        int show_seat_id FK
        float price
    }

    PAYMENTS {
        int id PK
        int booking_id FK
        int user_id FK
        float amount
        string currency
        string provider
        string order_id UK
        string transaction_id
        enum status "INITIATED, PENDING, SUCCESS, FAILED, REFUNDED"
        datetime created_at
    }

    COUPONS {
        int id PK
        string code UK
        enum discount_type "PERCENTAGE, FLAT"
        float discount_value
        float min_amount
        float max_discount
        datetime valid_to
        boolean is_active
    }
```

---

## Key Table Classifications

### 1. Identity, Access & System
- **`roles`**: System roles (`USER`, `ADMIN`).
- **`users`**: Customer and administrator credentials, profiles, and password hashes.
- **`notifications`**: User alert messages (booking confirmations, payment status updates).
- **`audit_logs`**: Immutable security audit trail tracking critical admin mutations (movie deletion, price adjustments, refund authorisations).

### 2. Cinema Infrastructure & Physical Topology
- **`cities`**: Metro areas and operating territories.
- **`theatres`**: Multiplex facilities with physical address and geospatial coordinates.
- **`screens`**: Auditoriums within a theatre (e.g. IMAX Laser, Dolby Atmos Screen 1).
- **`seats`**: Physical seating grid configuration per screen (`row`, `seat_number`, `tier`).

### 3. Movie Catalog & Metadata
- **`movies`**: Titles, plot, durations, certification, ratings, and media links.
- **`genres`** & **`movie_genres`**: Normalized many-to-many genre taxonomy.
- **`languages`** & **`movie_languages`**: Audio track availability.
- **`reviews`** & **`ratings`**: Verified customer sentiment with aggregate rollups.
- **`favorites`**: Customer watchlists.

### 4. Showtimes & Concurrency Inventory
- **`shows`**: Scheduled exhibition slot linking Movie + Theatre + Screen + Datetime + Base Price.
- **`show_seats`**: Operational runtime inventory state machine for each showtime.
  - States: `AVAILABLE` $\rightarrow$ `LOCKED` $\rightarrow$ `BOOKED`.
  - Holds `locked_until` (TTL expiration) and `locked_by_user_id`.

### 5. Financial Ledger, Bookings & Coupons
- **`bookings`**: Master reservation record with snapshot financial calculations.
- **`booking_items`**: Line items recording historical ticket price at transaction time.
- **`payments`**: Payment transaction lifecycle records (Paytm / Demo simulator).
- **`coupons`** & **`coupon_usages`**: Promotional discount rules and single-use audit logs.

### 6. Machine Learning Telemetry
- **`recommendation_events`**: Feedback loop logging impressions, clicks, and bookings resulting from AI recommendations.

---

## Critical Architectural Design Decisions

1. **Separation of `seats` from `show_seats`**:
   - `seats` represents the immutable physical layout of an auditorium (Screen 1 Row A Seat 1).
   - `show_seats` instantiates that physical seat for a specific scheduled date and time (`show_id`), maintaining independent state flags (`status`, `locked_until`, `price`). This allows a single physical seat to be reserved across hundreds of daily shows without collision.

2. **Price Snapshotting in `booking_items` and `bookings`**:
   - Movie ticket prices change over time (weekend surcharges, prime-time increases). Once a booking is created, the exact purchase price and tax breakdown are permanently snapshotted in `bookings` and `booking_items`, ensuring historical financial audits and invoices are 100% immutable.

3. **Composite Indexes for Hot Search Paths**:
   - `ix_show_seats_show_status`: `(show_id, status)` for ultra-fast auditorium seat availability lookups.
   - `ix_shows_movie_theatre_date`: `(movie_id, theatre_id, start_time)` for low-latency showtime schedule listings.
   - `ix_movies_slug`: Unique slug indexing for SEO-friendly canonical routing.
