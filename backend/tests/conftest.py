import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.base import Base
from app.database.session import get_db
from app.auth.security import get_password_hash, create_access_token
from app.models import Role, User, City, Theatre, Screen, Seat, Show, ShowSeat, Movie, Genre, Coupon
from datetime import datetime, date, timedelta, timezone

# Use an isolated SQLite test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_cinebook.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # Seed roles
    role_user = Role(name="USER", description="Standard User")
    role_admin = Role(name="ADMIN", description="Admin User")
    db.add_all([role_user, role_admin])
    db.commit()

    # Seed test users
    user_pwd = get_password_hash("User@123")
    admin_pwd = get_password_hash("Admin@123")

    test_user = User(
        email="testuser@cinebook.ai",
        full_name="Test User",
        phone="+919999900001",
        hashed_password=user_pwd,
        role_id=role_user.id
    )
    test_user_2 = User(
        email="testuser2@cinebook.ai",
        full_name="Second User",
        phone="+919999900002",
        hashed_password=user_pwd,
        role_id=role_user.id
    )
    test_admin = User(
        email="testadmin@cinebook.ai",
        full_name="Test Admin",
        phone="+919999900003",
        hashed_password=admin_pwd,
        role_id=role_admin.id
    )
    db.add_all([test_user, test_user_2, test_admin])
    db.commit()

    # Seed genre & movie
    genre = Genre(name="Sci-Fi", slug="sci-fi")
    db.add(genre)
    db.commit()

    movie = Movie(
        title="Test Inception",
        slug="test-inception",
        description="A dream within a dream",
        duration_minutes=148,
        release_date=date(2010, 7, 16),
        poster_url="https://example.com/poster.jpg",
        rating=8.8,
        vote_count=1000,
        genres=[genre]
    )
    db.add(movie)
    db.commit()

    # Seed city, theatre, screen, seats
    city = City(name="Test Mumbai", state="Maharashtra")
    db.add(city)
    db.commit()

    theatre = Theatre(name="Test PVR Cinema", city_id=city.id, address="Test Mall, Mumbai")
    db.add(theatre)
    db.commit()

    screen = Screen(theatre_id=theatre.id, screen_number=1, name="Screen 1", screen_type="2D", total_seats=10)
    db.add(screen)
    db.commit()

    seats = []
    for i in range(1, 11):
        s = Seat(screen_id=screen.id, row="A", seat_number=i, tier="STANDARD", price_multiplier=1.0)
        db.add(s)
        seats.append(s)
    db.commit()

    # Seed show
    now = datetime.now(timezone.utc)
    show = Show(
        movie_id=movie.id,
        theatre_id=theatre.id,
        screen_id=screen.id,
        start_time=now + timedelta(days=1),
        end_time=now + timedelta(days=1, hours=2),
        base_price=200.0,
        format="2D",
        language="English"
    )
    db.add(show)
    db.commit()

    for s in seats:
        ss = ShowSeat(show_id=show.id, seat_id=s.id, status="AVAILABLE", price=200.0)
        db.add(ss)
    db.commit()

    # Seed coupon
    coupon = Coupon(
        code="TEST50",
        description="50% off",
        discount_type="PERCENTAGE",
        discount_value=50.0,
        min_amount=100.0,
        max_discount=100.0,
        valid_from=now - timedelta(days=1),
        valid_to=now + timedelta(days=30),
        usage_limit=100
    )
    db.add(coupon)
    db.commit()

    db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def user_token():
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "testuser@cinebook.ai").first()
    db.close()
    return create_access_token({"sub": str(user.id), "role": "USER", "email": user.email})

@pytest.fixture
def user2_token():
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "testuser2@cinebook.ai").first()
    db.close()
    return create_access_token({"sub": str(user.id), "role": "USER", "email": user.email})

@pytest.fixture
def admin_token():
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "testadmin@cinebook.ai").first()
    db.close()
    return create_access_token({"sub": str(user.id), "role": "ADMIN", "email": user.email})
