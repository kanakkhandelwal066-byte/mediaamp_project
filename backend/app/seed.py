import os
import sys
from datetime import datetime, date, timedelta, timezone

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import engine
from app.database.session import SessionLocal
from app.database.base import Base
from app.auth.security import get_password_hash
from app.models import (
    Role, User, Genre, Language, Movie, movie_genres, movie_languages,
    City, Theatre, Screen, Seat, Show, ShowSeat, Booking, BookingItem,
    Payment, Coupon, CouponUsage, Review, Rating, Favorite, RecommendationEvent,
    Notification, AuditLog
)

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def seed_database():
    print("[SEED] Starting CineBook AI database seeding...")
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_role = db.query(Role).first()
        if existing_role:
            print("Database already contains data. Cleaning up tables for fresh seed...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        # 1. Roles
        print("  -> Seeding Roles...")
        role_user = Role(name="USER", description="Standard Moviegoer")
        role_admin = Role(name="ADMIN", description="System Administrator")
        db.add_all([role_user, role_admin])
        db.commit()
        db.refresh(role_user)
        db.refresh(role_admin)

        # 2. Users
        print("  -> Seeding Users...")
        default_pwd = get_password_hash("User@123")
        admin_pwd = get_password_hash("Admin@123")

        admin_user = User(
            email="admin@cinebook.ai",
            phone="+919876543210",
            hashed_password=admin_pwd,
            full_name="CineBook Admin",
            role_id=role_admin.id,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        )
        user_john = User(
            email="user@cinebook.ai",
            phone="+919876543211",
            hashed_password=default_pwd,
            full_name="John Doe",
            role_id=role_user.id,
            avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
        )
        user_priya = User(
            email="priya@cinebook.ai",
            phone="+919876543212",
            hashed_password=default_pwd,
            full_name="Priya Sharma",
            role_id=role_user.id,
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
        )
        user_rahul = User(
            email="rahul@cinebook.ai",
            phone="+919876543213",
            hashed_password=default_pwd,
            full_name="Rahul Verma",
            role_id=role_user.id,
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        )
        user_ananya = User(
            email="ananya@cinebook.ai",
            phone="+919876543214",
            hashed_password=default_pwd,
            full_name="Ananya Iyer",
            role_id=role_user.id,
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        )
        db.add_all([admin_user, user_john, user_priya, user_rahul, user_ananya])
        db.commit()

        # 3. Genres
        print("  -> Seeding Genres...")
        genre_names = ["Action", "Sci-Fi", "Drama", "Thriller", "Comedy", "Adventure", "Animation", "Romance", "Crime", "Mystery"]
        genres_dict = {}
        for g_name in genre_names:
            g = Genre(name=g_name, slug=g_name.lower())
            db.add(g)
            genres_dict[g_name] = g
        db.commit()

        # 4. Languages
        print("  -> Seeding Languages...")
        lang_data = [
            ("English", "en"), ("Hindi", "hi"), ("Tamil", "ta"),
            ("Telugu", "te"), ("Malayalam", "ml"), ("Kannada", "kn")
        ]
        langs_dict = {}
        for l_name, l_code in lang_data:
            l = Language(name=l_name, code=l_code)
            db.add(l)
            langs_dict[l_name] = l
        db.commit()

        # 5. Movies
        print("  -> Seeding 12 Blockbuster Movies...")
        movies_raw = [
            {
                "title": "Oppenheimer",
                "description": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
                "duration_minutes": 180,
                "release_date": date(2023, 7, 21),
                "poster_url": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/rLb2cw6ivRaxuqEv430526URBY7.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=uYPbbksJxIg",
                "rating": 8.9,
                "vote_count": 14200,
                "director": "Christopher Nolan",
                "cast": "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh",
                "keywords": "atomic bomb, manhattan project, physics, quantum mechanics, biography, history, world war ii",
                "certification": "A",
                "is_trending": True,
                "genres": ["Drama", "Thriller"],
                "languages": ["English", "Hindi"]
            },
            {
                "title": "Dune: Part Two",
                "description": "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
                "duration_minutes": 166,
                "release_date": date(2024, 3, 1),
                "poster_url": "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=Way9Dexny3w",
                "rating": 8.8,
                "vote_count": 9850,
                "director": "Denis Villeneuve",
                "cast": "Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler",
                "keywords": "desert planet, spice, rebellion, sci-fi epic, fremen, prophecy, worms, destiny",
                "certification": "UA",
                "is_trending": True,
                "genres": ["Sci-Fi", "Adventure", "Action"],
                "languages": ["English", "Hindi", "Tamil", "Telugu"]
            },
            {
                "title": "Interstellar",
                "description": "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
                "duration_minutes": 169,
                "release_date": date(2014, 11, 7),
                "poster_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
                "rating": 8.7,
                "vote_count": 21500,
                "director": "Christopher Nolan",
                "cast": "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine",
                "keywords": "black hole, wormhole, relativity, space exploration, time dilation, love, nasa, tesseract",
                "certification": "UA",
                "is_trending": True,
                "genres": ["Sci-Fi", "Drama", "Adventure"],
                "languages": ["English", "Hindi"]
            },
            {
                "title": "Inception",
                "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                "duration_minutes": 148,
                "release_date": date(2010, 7, 16),
                "poster_url": "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
                "rating": 8.8,
                "vote_count": 25000,
                "director": "Christopher Nolan",
                "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy, Ken Watanabe",
                "keywords": "dreams, subconscious, heist, totem, architecture, mind manipulation, spinning top",
                "certification": "UA",
                "is_trending": False,
                "genres": ["Action", "Sci-Fi", "Adventure"],
                "languages": ["English", "Hindi"]
            },
            {
                "title": "The Dark Knight",
                "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                "duration_minutes": 152,
                "release_date": date(2008, 7, 18),
                "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=EXeTwQWrcwY",
                "rating": 9.0,
                "vote_count": 31000,
                "director": "Christopher Nolan",
                "cast": "Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine, Maggie Gyllenhaal",
                "keywords": "joker, batman, gotham city, vigilante, anarchy, justice, chaos, crime lord",
                "certification": "UA",
                "is_trending": False,
                "genres": ["Action", "Crime", "Drama"],
                "languages": ["English", "Hindi"]
            },
            {
                "title": "Spider-Man: Across the Spider-Verse",
                "description": "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
                "duration_minutes": 140,
                "release_date": date(2023, 6, 2),
                "poster_url": "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=cqGjhVJWtEg",
                "rating": 8.7,
                "vote_count": 8900,
                "director": "Joaquim Dos Santos, Kemp Powers",
                "cast": "Shameik Moore, Hailee Steinfeld, Oscar Isaac, Jake Johnson, Daniel Kaluuya",
                "keywords": "multiverse, spider-man, animation, canon event, brooklyn, miles morales, gwen stacy",
                "certification": "U",
                "is_trending": True,
                "genres": ["Animation", "Action", "Adventure", "Sci-Fi"],
                "languages": ["English", "Hindi", "Tamil", "Telugu"]
            },
            {
                "title": "Gladiator II",
                "description": "Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after the powerful emperors of Rome conquer his home.",
                "duration_minutes": 148,
                "release_date": date(2024, 11, 15),
                "poster_url": "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/euYIwmwkmz95mnEx7vBM0Mqz5r5.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=4rgYUipGJNo",
                "rating": 8.3,
                "vote_count": 6400,
                "director": "Ridley Scott",
                "cast": "Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen, Joseph Quinn",
                "keywords": "roman empire, colosseum, gladiator, revenge, swords, epic historical drama",
                "certification": "A",
                "is_trending": True,
                "genres": ["Action", "Adventure", "Drama"],
                "languages": ["English", "Hindi"]
            },
            {
                "title": "Avengers: Endgame",
                "description": "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions.",
                "duration_minutes": 181,
                "release_date": date(2019, 4, 26),
                "poster_url": "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=TcMBFSGVi1c",
                "rating": 8.4,
                "vote_count": 24000,
                "director": "Anthony Russo, Joe Russo",
                "cast": "Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth, Scarlett Johansson",
                "keywords": "superheroes, thanos, infinity stones, marvel cinematic universe, time travel",
                "certification": "UA",
                "is_trending": False,
                "genres": ["Action", "Adventure", "Sci-Fi"],
                "languages": ["English", "Hindi", "Tamil", "Telugu"]
            },
            {
                "title": "Blade Runner 2049",
                "description": "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
                "duration_minutes": 164,
                "release_date": date(2017, 10, 6),
                "poster_url": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/ilRyASDvt7vDU90622v9Fv0o50y.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=gCcx85zbxz4",
                "rating": 8.0,
                "vote_count": 13500,
                "director": "Denis Villeneuve",
                "cast": "Ryan Gosling, Harrison Ford, Ana de Armas, Sylvia Hoeks, Robin Wright",
                "keywords": "cyberpunk, dystopia, replicant, artificial intelligence, neo-noir, future los angeles",
                "certification": "A",
                "is_trending": False,
                "genres": ["Sci-Fi", "Mystery", "Drama"],
                "languages": ["English"]
            },
            {
                "title": "Jawan",
                "description": "A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in society.",
                "duration_minutes": 169,
                "release_date": date(2023, 9, 7),
                "poster_url": "https://image.tmdb.org/t/p/w500/jNQvlFtzQWpQY7Yx4YVl89gqM.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/bckxSN9tvv2g4zE0vK8lE1GzIe6.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=MWOlnZSnXWE",
                "rating": 7.9,
                "vote_count": 5200,
                "director": "Atlee",
                "cast": "Shah Rukh Khan, Nayanthara, Vijay Sethupathi, Deepika Padukone, Sanya Malhotra",
                "keywords": "vigilante, social justice, father son, metro hijack, mass entertainer, action thriller",
                "certification": "UA",
                "is_trending": True,
                "genres": ["Action", "Thriller"],
                "languages": ["Hindi", "Tamil", "Telugu"]
            },
            {
                "title": "RRR",
                "description": "A fearless revolutionary and an officer in the British force, who once shared a deep bond, decide to join forces and chart out an inspiring path of freedom against the despotic rulers.",
                "duration_minutes": 187,
                "release_date": date(2022, 3, 25),
                "poster_url": "https://image.tmdb.org/t/p/w500/wE0q27Y0AE9gL1fE2e3u9QzZ8jJ.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxShY9JH1jmyOq.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=NgBoMJy386M",
                "rating": 8.6,
                "vote_count": 7800,
                "director": "S.S. Rajamouli",
                "cast": "N.T. Rama Rao Jr., Ram Charan, Ajay Devgn, Alia Bhatt, Shriya Saran",
                "keywords": "british raj, friendship, rebellion, freedom fighters, epic action, naatu naatu",
                "certification": "UA",
                "is_trending": True,
                "genres": ["Action", "Drama", "Adventure"],
                "languages": ["Telugu", "Hindi", "Tamil", "Malayalam", "Kannada"]
            },
            {
                "title": "Kalki 2898 AD",
                "description": "Set in a post-apocalyptic world in 2898 AD, a modern avatar of Vishnu descends to Earth to protect the world from evil forces.",
                "duration_minutes": 181,
                "release_date": date(2024, 6, 27),
                "poster_url": "https://image.tmdb.org/t/p/w500/3U7T253h6wzS5N9p9z9g9f6y9y6.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/original/mKFLkR9Tz8xP7n1u6d9fG7d1o3k.jpg",
                "trailer_url": "https://www.youtube.com/watch?v=kQDd1AhGIHk",
                "rating": 8.1,
                "vote_count": 6100,
                "director": "Nag Ashwin",
                "cast": "Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone, Disha Patani",
                "keywords": "mythology, sci-fi, dystopia, kashi, ashwatthama, mahabharata, future, complex",
                "certification": "UA",
                "is_trending": True,
                "genres": ["Sci-Fi", "Action", "Adventure"],
                "languages": ["Telugu", "Hindi", "Tamil", "Malayalam", "Kannada"]
            }
        ]

        created_movies = []
        for m_data in movies_raw:
            genre_objs = [genres_dict[g] for g in m_data["genres"] if g in genres_dict]
            lang_objs = [langs_dict[l] for l in m_data["languages"] if l in langs_dict]
            
            # Simple slug generation
            slug = m_data["title"].lower().replace(":", "").replace("'", "").replace("-", " ").strip()
            slug = "-".join(slug.split())

            movie = Movie(
                title=m_data["title"],
                slug=slug,
                description=m_data["description"],
                duration_minutes=m_data["duration_minutes"],
                release_date=m_data["release_date"],
                poster_url=m_data["poster_url"],
                backdrop_url=m_data["backdrop_url"],
                trailer_url=m_data["trailer_url"],
                rating=m_data["rating"],
                vote_count=m_data["vote_count"],
                director=m_data["director"],
                cast=m_data["cast"],
                keywords=m_data["keywords"],
                certification=m_data["certification"],
                is_trending=m_data["is_trending"],
                genres=genre_objs,
                languages=lang_objs
            )
            db.add(movie)
            created_movies.append(movie)
        db.commit()

        # 6. Cities
        print("  -> Seeding 6 Indian Metro Cities...")
        cities_data = [
            ("Mumbai", "Maharashtra"),
            ("Delhi NCR", "Delhi"),
            ("Bengaluru", "Karnataka"),
            ("Hyderabad", "Telangana"),
            ("Chennai", "Tamil Nadu"),
            ("Pune", "Maharashtra")
        ]
        created_cities = []
        for c_name, c_state in cities_data:
            c = City(name=c_name, state=c_state)
            db.add(c)
            created_cities.append(c)
        db.commit()

        # 7. Theatres
        print("  -> Seeding 12 Multiplex Theatres...")
        theatres_raw = [
            # Mumbai
            ("PVR ICON Phoenix Palladium", created_cities[0].id, "High Street Phoenix, Senapati Bapat Marg, Lower Parel, Mumbai", 18.995, 72.825),
            ("INOX Megaplex Inorbit Malad", created_cities[0].id, "Inorbit Mall, Link Road, Malad West, Mumbai", 19.176, 72.836),
            ("Cinepolis VIP Viviana Mall", created_cities[0].id, "Viviana Mall, Eastern Express Hwy, Thane West, Mumbai", 19.208, 72.972),
            # Delhi NCR
            ("PVR Director's Cut Vasant Kunj", created_cities[1].id, "Ambience Mall, Nelson Mandela Marg, Vasant Kunj, New Delhi", 28.541, 77.155),
            ("INOX Laserplex Nehru Place", created_cities[1].id, "Epicuria Food Mall, Nehru Place Metro Station, New Delhi", 28.550, 77.251),
            # Bengaluru
            ("PVR Superplex Forum Mall Koramangala", created_cities[2].id, "The Forum Mall, Hosur Road, Koramangala, Bengaluru", 12.934, 77.611),
            ("INOX Megaplex Garuda Mall", created_cities[2].id, "Garuda Mall, Magrath Road, Ashok Nagar, Bengaluru", 12.970, 77.609),
            ("Cinepolis VIP Forum Shantiniketan", created_cities[2].id, "Whitefield Main Road, Hoodi, Bengaluru", 12.989, 77.728),
            # Hyderabad
            ("Prasads IMAX Multiplex", created_cities[3].id, "NTR Gardens, Necklace Road, Hyderabad", 17.412, 78.468),
            ("AMB Cinemas Gachibowli", created_cities[3].id, "Sarath City Capital Mall, Gachibowli, Hyderabad", 17.458, 78.363),
            # Chennai
            ("SPI Sathyam Cinemas Royapettah", created_cities[4].id, "Thiru Vi Ka Road, Royapettah, Chennai", 13.056, 80.260),
            # Pune
            ("PVR Phoenix Marketcity Viman Nagar", created_cities[5].id, "Phoenix Marketcity, Viman Nagar, Pune", 18.562, 73.916)
        ]
        created_theatres = []
        for t_name, c_id, addr, lat, lng in theatres_raw:
            th = Theatre(name=t_name, city_id=c_id, address=addr, latitude=lat, longitude=lng, phone="+912240001122")
            db.add(th)
            created_theatres.append(th)
        db.commit()

        # 8. Screens & 100+ Seats per screen
        print("  -> Seeding Screens and 112 Seats per screen...")
        created_screens = []
        screen_configs = [
            ("Audi 1 - IMAX Laser 3D", "IMAX 3D", 1),
            ("Audi 2 - Dolby Atmos", "Dolby Atmos", 2),
            ("Audi 3 - 4DX Dynamic", "4DX", 3)
        ]

        rows = ["A", "B", "C", "D", "E", "F", "G", "H"] # 8 rows * 14 seats = 112 seats

        for th in created_theatres:
            for s_name, s_type, s_num in screen_configs:
                screen = Screen(
                    theatre_id=th.id,
                    screen_number=s_num,
                    name=s_name,
                    screen_type=s_type,
                    total_seats=112
                )
                db.add(screen)
                db.flush()
                created_screens.append(screen)

                # Generate seats
                for r_idx, r in enumerate(rows):
                    if r in ["A", "B", "C"]:
                        tier = "STANDARD"
                        mult = 1.0
                    elif r in ["D", "E", "F"]:
                        tier = "PREMIUM"
                        mult = 1.4
                    else:
                        tier = "VIP"
                        mult = 2.0

                    for num in range(1, 15):
                        seat = Seat(
                            screen_id=screen.id,
                            row=r,
                            seat_number=num,
                            tier=tier,
                            price_multiplier=mult
                        )
                        db.add(seat)
        db.commit()

        # 9. Shows & ShowSeats
        print("  -> Scheduling shows for EVERY movie on EVERY date across all cities...")
        now = datetime.now(timezone.utc)
        show_times_offsets = [
            timedelta(hours=10),             # 10:00 AM
            timedelta(hours=13, minutes=30), # 01:30 PM
            timedelta(hours=17),             # 05:00 PM
            timedelta(hours=20, minutes=45)  # 08:45 PM
        ]

        # Group theatres by city
        city_theatres_map = {}
        for th in created_theatres:
            city_theatres_map.setdefault(th.city_id, []).append(th)

        created_shows = []
        for day in range(0, 5): # 5 days: Today, Tomorrow, +2d, +3d, +4d
            day_base = (now + timedelta(days=day)).replace(hour=0, minute=0, second=0, microsecond=0)

            for city_id, th_list in city_theatres_map.items():
                for m_idx, movie in enumerate(created_movies):
                    # Ensure EVERY movie is scheduled in this city on this day
                    # Rotate theatres & screens
                    th = th_list[m_idx % len(th_list)]
                    th_screens = [s for s in created_screens if s.theatre_id == th.id]
                    sc = th_screens[m_idx % len(th_screens)]
                    time_offset = show_times_offsets[(m_idx + day) % len(show_times_offsets)]

                    st = day_base + time_offset
                    et = st + timedelta(minutes=movie.duration_minutes + 20)

                    base_p = 320.0 if "IMAX" in sc.name else 240.0
                    show = Show(
                        movie_id=movie.id,
                        theatre_id=th.id,
                        screen_id=sc.id,
                        start_time=st,
                        end_time=et,
                        base_price=base_p,
                        format=sc.screen_type,
                        language=movie.languages[0].name if movie.languages else "English"
                    )
                    db.add(show)
                    created_shows.append(show)

        db.commit()

        # Cache seats per screen to avoid querying seats repeatedly
        screen_seats_cache = {}
        for sc in created_screens:
            screen_seats_cache[sc.id] = db.query(Seat).filter(Seat.screen_id == sc.id).all()

        print(f"  -> Generated {len(created_shows)} shows. Now seeding ShowSeats...")
        show_seats_batch = []
        for show in created_shows:
            sc_seats = screen_seats_cache.get(show.screen_id, [])
            for s in sc_seats:
                seat_price = round(show.base_price * s.price_multiplier, 2)
                show_seats_batch.append(ShowSeat(
                    show_id=show.id,
                    seat_id=s.id,
                    status="AVAILABLE",
                    price=seat_price
                ))
            if len(show_seats_batch) >= 2000:
                db.bulk_save_objects(show_seats_batch)
                db.commit()
                show_seats_batch = []

        if show_seats_batch:
            db.bulk_save_objects(show_seats_batch)
            db.commit()
        db.commit()

        # 10. Coupons
        print("  -> Seeding Promotional Coupons...")
        now_dt = datetime.now(timezone.utc)
        coupons = [
            Coupon(
                code="WELCOME50",
                description="Get 50% discount up to ₹150 on your first booking",
                discount_type="PERCENTAGE",
                discount_value=50.0,
                min_amount=300.0,
                max_discount=150.0,
                valid_from=now_dt - timedelta(days=10),
                valid_to=now_dt + timedelta(days=90),
                usage_limit=5000,
                times_used=12
            ),
            Coupon(
                code="CINE100",
                description="Flat ₹100 discount on tickets above ₹400",
                discount_type="FLAT",
                discount_value=100.0,
                min_amount=400.0,
                max_discount=100.0,
                valid_from=now_dt - timedelta(days=5),
                valid_to=now_dt + timedelta(days=60),
                usage_limit=2000,
                times_used=8
            ),
            Coupon(
                code="BLOCKBUSTER20",
                description="Flat 20% discount up to ₹200 on all blockbuster shows",
                discount_type="PERCENTAGE",
                discount_value=20.0,
                min_amount=250.0,
                max_discount=200.0,
                valid_from=now_dt - timedelta(days=2),
                valid_to=now_dt + timedelta(days=45),
                usage_limit=1000,
                times_used=5
            )
        ]
        db.add_all(coupons)
        db.commit()

        # 11. Initial Reviews, Ratings, and Favorites
        print("  -> Seeding User Reviews, Ratings, and Favorites...")
        reviews_data = [
            (user_john.id, created_movies[0].id, 9.5, "Masterpiece of cinematic tension", "Christopher Nolan at the absolute peak of his craft. Cillian Murphy delivers an Oscar-winning performance."),
            (user_priya.id, created_movies[0].id, 9.0, "Phenomenal score and acting", "The sound design in IMAX blew me away. Truly historic piece of cinema."),
            (user_rahul.id, created_movies[1].id, 9.5, "Epic sci-fi spectacle", "Denis Villeneuve has created the Star Wars of this generation. Visuals are breathtaking."),
            (user_ananya.id, created_movies[2].id, 10.0, "Timeless emotional journey", "The docking scene with Hans Zimmer's score is pure perfection.")
        ]
        for u_id, m_id, sc, t, c in reviews_data:
            r = Review(user_id=u_id, movie_id=m_id, rating=sc, title=t, content=c, is_verified_booking=True)
            rt = Rating(user_id=u_id, movie_id=m_id, score=sc)
            fav = Favorite(user_id=u_id, movie_id=m_id)
            db.add_all([r, rt, fav])
        db.commit()

        # 12. Recommendation Interaction Events (for ML training)
        print("  -> Seeding Recommendation Interaction Events...")
        events_data = [
            # John likes Nolan Sci-Fi / Drama
            (user_john.id, created_movies[0].id, "booking", 5.0),
            (user_john.id, created_movies[2].id, "booking", 5.0),
            (user_john.id, created_movies[3].id, "favorite", 3.0),
            (user_john.id, created_movies[1].id, "movie_view", 1.0),
            # Priya likes Sci-Fi and Animation
            (user_priya.id, created_movies[1].id, "booking", 5.0),
            (user_priya.id, created_movies[5].id, "booking", 5.0),
            (user_priya.id, created_movies[0].id, "rating", 4.0),
            # Rahul likes High-octane Action
            (user_rahul.id, created_movies[4].id, "booking", 5.0),
            (user_rahul.id, created_movies[9].id, "booking", 5.0),
            (user_rahul.id, created_movies[10].id, "booking", 5.0),
            (user_rahul.id, created_movies[6].id, "favorite", 3.0),
            # Ananya likes Sci-Fi & Drama
            (user_ananya.id, created_movies[2].id, "booking", 5.0),
            (user_ananya.id, created_movies[8].id, "booking", 5.0),
            (user_ananya.id, created_movies[1].id, "rating", 4.5)
        ]
        for u_id, m_id, ev_t, w in events_data:
            ev = RecommendationEvent(user_id=u_id, movie_id=m_id, event_type=ev_t, weight=w)
            db.add(ev)
        db.commit()

        # 13. Completed Sample Bookings and Payments
        print("  -> Seeding Sample Confirmed Bookings and Payments...")
        first_show = created_shows[0]
        # Book 2 seats in first show
        seats_to_book = db.query(ShowSeat).filter(ShowSeat.show_id == first_show.id).limit(2).all()
        for ss in seats_to_book:
            ss.status = "BOOKED"
        
        sample_booking = Booking(
            booking_reference="CB-2026-INIT-8842",
            user_id=user_john.id,
            show_id=first_show.id,
            total_amount=sum(s.price for s in seats_to_book),
            discount_amount=50.0,
            convenience_fee=35.0,
            tax_amount=6.30,
            final_amount=sum(s.price for s in seats_to_book) - 50.0 + 35.0 + 6.30,
            status="CONFIRMED",
            qr_code_token="CB-TOKEN-DEMO-UUID-12345"
        )
        db.add(sample_booking)
        db.flush()

        for ss in seats_to_book:
            b_item = BookingItem(
                booking_id=sample_booking.id,
                show_seat_id=ss.id,
                seat_row=ss.seat.row,
                seat_number=ss.seat.seat_number,
                seat_tier=ss.seat.tier,
                price=ss.price
            )
            db.add(b_item)

        sample_payment = Payment(
            booking_id=sample_booking.id,
            user_id=user_john.id,
            amount=sample_booking.final_amount,
            currency="INR",
            provider="PAYTM",
            transaction_id="PAYTM_TXN_SEED_998811",
            order_id="CB_ORD_SEED_776655",
            status="SUCCESS",
            payment_method="UPI",
            gateway_response='{"RESPCODE": "01", "STATUS": "TXN_SUCCESS", "BANKTXNID": "BANK_991823"}'
        )
        db.add(sample_payment)

        # Audit Log
        audit = AuditLog(
            user_id=user_john.id,
            action="BOOKING_CONFIRMED",
            entity_type="Booking",
            entity_id=str(sample_booking.id),
            metadata_json='{"seats": 2, "booking_reference": "CB-2026-INIT-8842"}'
        )
        db.add(audit)
        db.commit()

        print("[OK] CineBook AI Database seeded successfully!")
        print("--------------------------------------------------")
        print("Credentials for testing:")
        print("  Admin User: admin@cinebook.ai / Admin@123")
        print("  Standard User: user@cinebook.ai / User@123")
        print("  Available Coupons: WELCOME50, CINE100, BLOCKBUSTER20")
        print("--------------------------------------------------")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
