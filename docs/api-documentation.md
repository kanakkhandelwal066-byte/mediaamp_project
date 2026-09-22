# REST API Reference & Specification

All CineBook AI APIs follow RESTful conventions, return JSON payloads, and are mounted under the `/api/v1` prefix.

Interactive Swagger UI documentation is available at:
`http://localhost:8000/docs`

ReDoc specification is available at:
`http://localhost:8000/redoc`

---

## Standard Envelope & Error Protocols

### Standard Success Response Envelope
Every endpoint returns a uniform wrapper:
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "error_code": null,
  "details": null
}
```

### Standard Error Response Envelope
```json
{
  "success": false,
  "message": "Seat already reserved or locked by another user",
  "data": null,
  "error_code": "SEAT_UNAVAILABLE_OR_LOCKED",
  "details": {
    "conflicting_seat_ids": [102]
  }
}
```

### Common HTTP Status Codes
| Code | Meaning | Common Scenario |
| :--- | :--- | :--- |
| **200 OK** | Request succeeded | Retrieval, successful status mutation |
| **201 Created** | Resource created | Registration, movie created, booking logged |
| **400 Bad Request** | Business validation failure | Invalid coupon, past date show schedule |
| **401 Unauthorized** | Missing or expired JWT | Unauthenticated access to protected route |
| **403 Forbidden** | Insufficient permissions | Standard user accessing `/admin/*` |
| **404 Not Found** | Resource missing | Unknown movie ID, nonexistent booking |
| **409 Conflict** | Concurrency conflict | Attempting to lock an already locked seat |
| **422 Unprocessable** | Pydantic validation failure | Malformed email, missing required fields |
| **500 Server Error** | Unexpected exception | Gateway timeout, unhandled database crash |

---

## API Endpoints Summary (36 Endpoints)

### 1. Authentication & Users (`/api/v1/auth`)
- `POST /auth/register` — Register new user account.
- `POST /auth/login` — Authenticate credentials and receive Bearer JWT token.
- `GET /auth/me` — Retrieve profile of currently authenticated user.
- `PUT /auth/me` — Update user profile details (name, phone, avatar).
- `POST /auth/refresh` — Refresh expired JWT token.

### 2. Movies & Catalog (`/api/v1/movies`)
- `GET /movies` — Filtered catalog search (search text, genre, language, city, min rating, pagination).
- `GET /movies/trending` — Top trending featured movie titles.
- `GET /movies/genres` — All active genres.
- `GET /movies/languages` — All audio languages.
- `GET /movies/{movie_id}` — Complete movie details with genres, cast, and ratings.
- `POST /movies` — *(Admin only)* Create new movie title.
- `PUT /movies/{movie_id}` — *(Admin only)* Update movie metadata.
- `DELETE /movies/{movie_id}` — *(Admin only)* Deactivate movie.

### 3. Theatres & Screens (`/api/v1/theatres`)
- `GET /theatres/cities` — List operating metro areas.
- `GET /theatres` — List multiplex theatres, optionally filtered by `city_id`.
- `GET /theatres/{theatre_id}` — Theatre details including child screens and addresses.
- `POST /theatres` — *(Admin only)* Add new multiplex theatre.
- `POST /theatres/{theatre_id}/screens` — *(Admin only)* Add auditorium screen to theatre.

### 4. Shows & Scheduling (`/api/v1/shows`)
- `GET /shows` — List scheduled showtimes (filters: `movie_id`, `theatre_id`, `city_id`, `date_str`).
- `GET /shows/{show_id}` — Show details with auditorium specs and seat availability counters.
- `POST /shows` — *(Admin only)* Schedule new show slot with base pricing.
- `DELETE /shows/{show_id}` — *(Admin only)* Cancel scheduled show.

### 5. Seat Inventory & Locking (`/api/v1/seats`, `/api/v1/shows/{id}/seats`)
- `GET /shows/{show_id}/seats` — Auditorium seating grid matrix with real-time seat states (`AVAILABLE`, `LOCKED`, `BOOKED`).
- `POST /seats/lock` — Concurrency-safe atomic seat reservation with 5-minute TTL lock.
- `POST /seats/unlock` — Release locked seats manually before TTL expires.

### 6. Bookings & Coupons (`/api/v1/bookings`, `/api/v1/coupons`)
- `POST /bookings` — Create pending reservation, calculate pricing breakdown, apply coupons.
- `GET /bookings/me` — Customer's active and historical reservations list.
- `GET /bookings/{booking_id}` — Full reservation details, itemized fees, and status.
- `POST /bookings/{booking_id}/cancel` — Cancel confirmed reservation and release seats.
- `GET /bookings/{booking_id}/ticket` — Retrieve ticket boarding pass with Base64 QR code.
- `GET /coupons` — List promotional coupon codes.
- `POST /coupons/validate` — Validate coupon eligibility against cart value.

### 7. Payments (`/api/v1/payments`)
- `POST /payments/initiate` — Initiate transaction order for a pending booking.
- `POST /payments/simulate` — Demo Payment Simulator (`SUCCESS`, `FAILURE`, `PENDING`).
- `POST /payments/paytm/callback` — Webhook handler for Paytm payment gateway response.
- `GET /payments/{order_id}/status` — Poll current payment settlement status.

### 8. Machine Learning Recommendations (`/api/v1/recommendations`)
- `GET /recommendations` — Catalog recommendations (TF-IDF content similarity).
- `GET /recommendations/me` — Personalized hybrid recommendations (Content + Collaborative + Explainability).

### 9. Reviews & Sentiment (`/api/v1/reviews`)
- `GET /reviews/movie/{movie_id}` — User reviews and star ratings for a movie.
- `POST /reviews` — Submit verified review and rating.

### 10. Admin Telemetry & Audit (`/api/v1/admin`)
- `GET /admin/analytics` — Comprehensive BI metrics (revenue trend, occupancy, top movies).
- `GET /admin/bookings` — Platform-wide booking audit ledger with pagination.
- `GET /admin/users` — Registered customer accounts audit.
