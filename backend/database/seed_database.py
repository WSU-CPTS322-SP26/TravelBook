from datetime import datetime
from sqlmodel import Session
from datetime import timedelta
from passlib.context import CryptContext
from database.models import *

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed_database(engine):
    """Populate database with test data"""

    with Session(engine) as session:

        # ════════════════════════════════════════════════════════
        # CREATE USERS
        # ════════════════════════════════════════════════════════
        print("Creating users...")

        users_data = [
            {"username": "alice",   "email": "alice@example.com",   "name": "Alice Johnson",    "password": "password123"},
            {"username": "bob",     "email": "bob@example.com",     "name": "Bob Smith",        "password": "password123"},
            {"username": "charlie", "email": "charlie@example.com", "name": "Charlie Williams", "password": "password123"},
            {"username": "diana",   "email": "diana@example.com",   "name": "Diana Brown",      "password": "password123"},
            {"username": "eve",     "email": "eve@example.com",     "name": "Eve Davis",        "password": "password123"},
        ]

        users = []
        for user_data in users_data:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                name=user_data["name"],
                hashed_password=hash_password(user_data["password"]),
                friends=[]
            )
            session.add(user)
            users.append(user)

        session.commit()
        for user in users:
            session.refresh(user)

        print(f"✓ Created {len(users)} users")

        # ════════════════════════════════════════════════════════
        # CREATE FRIENDSHIPS
        # ════════════════════════════════════════════════════════
        for user in users:
            session.refresh(user)

        # ════════════════════════════════════════════════════════
        # WIRE UP FRIENDSHIPS (based on shared conversations)
        # ════════════════════════════════════════════════════════
        # alice(0) ↔ bob(1)         — conv1
        # alice(0) ↔ charlie(2)     — conv2
        # alice(0) ↔ diana(3)       — conv2
        # charlie(2) ↔ diana(3)     — conv2
        # everyone ↔ everyone       — conv3 adds eve(4) to the mix

        friend_pairs = [
            (0, 1),  # alice ↔ bob
            (0, 2),  # alice ↔ charlie
            (0, 3),  # alice ↔ diana
            (0, 4),  # alice ↔ eve    (conv3)
            (1, 2),  # bob ↔ charlie  (conv3)
            (1, 3),  # bob ↔ diana    (conv3)
            (1, 4),  # bob ↔ eve      (conv3)
            (2, 3),  # charlie ↔ diana
            (2, 4),  # charlie ↔ eve  (conv3)
            (3, 4),  # diana ↔ eve    (conv3)
        ]

        for a, b in friend_pairs:
            users[a].friends = list(set(users[a].friends + [users[b].id]))
            users[b].friends = list(set(users[b].friends + [users[a].id]))

        for user in users:
            session.add(user)

        session.commit()
        for user in users:
            session.refresh(user)

        print(f"✓ Wired friendships across {len(friend_pairs)} pairs")


        # ════════════════════════════════════════════════════════
        # CREATE CONVERSATIONS
        # ════════════════════════════════════════════════════════
        print("Creating conversations...")

        # Conversation 1: Alice & Bob (private chat)
        conv1 = Conversation()
        session.add(conv1)
        session.commit()
        session.refresh(conv1)

        session.add_all([
            UserConversationLink(user_id=users[0].id, conversation_id=conv1.id),
            UserConversationLink(user_id=users[1].id, conversation_id=conv1.id),
        ])

        # Conversation 2: Alice, Charlie, Diana (group chat)
        conv2 = Conversation()
        session.add(conv2)
        session.commit()
        session.refresh(conv2)

        session.add_all([
            UserConversationLink(user_id=users[0].id, conversation_id=conv2.id),
            UserConversationLink(user_id=users[2].id, conversation_id=conv2.id),
            UserConversationLink(user_id=users[3].id, conversation_id=conv2.id),
        ])

        # Conversation 3: All users (big group)
        conv3 = Conversation()
        session.add(conv3)
        session.commit()
        session.refresh(conv3)

        session.add_all([
            UserConversationLink(user_id=user.id, conversation_id=conv3.id)
            for user in users
        ])

        session.commit()
        conversations = [conv1, conv2, conv3]
        print(f"✓ Created {len(conversations)} conversations")

        # ════════════════════════════════════════════════════════
        # CREATE MESSAGES
        # ════════════════════════════════════════════════════════
        print("Creating messages...")

        # Conv 1 — private (Alice ↔ Bob): receiver_user_id set
        messages_conv1 = [
            {"sender": users[0], "receiver": users[1], "content": "Hey Bob! Want to plan a trip to Japan?",    "minutes_ago": 120},
            {"sender": users[1], "receiver": users[0], "content": "Yes! I've always wanted to go to Tokyo!",   "minutes_ago": 118},
            {"sender": users[0], "receiver": users[1], "content": "Great! Let me create a trip plan",          "minutes_ago": 115},
            {"sender": users[1], "receiver": users[0], "content": "Should we invite others?",                  "minutes_ago": 110},
            {"sender": users[0], "receiver": users[1], "content": "Good idea! I'll add Charlie and Diana",     "minutes_ago": 105},
        ]

        for msg_data in messages_conv1:
            session.add(Message(
                content=msg_data["content"],
                sender_user_id=msg_data["sender"].id,
                receiver_user_id=msg_data["receiver"].id,  # private — set receiver
                conversation_id=conv1.id,
                timestamp=datetime.now() - timedelta(minutes=msg_data["minutes_ago"])
            ))

        # Conv 2 — group (Alice, Charlie, Diana): receiver_user_id = None
        messages_conv2 = [
            {"sender": users[0], "content": "Hey everyone! Planning a Tokyo trip!",          "minutes_ago": 100},
            {"sender": users[2], "content": "Count me in! 🎌",                               "minutes_ago": 95},
            {"sender": users[3], "content": "I'm so excited! When are we thinking?",         "minutes_ago": 90},
            {"sender": users[0], "content": "How about late spring? Cherry blossoms!",       "minutes_ago": 85},
            {"sender": users[2], "content": "Perfect! I'll start looking at flights",        "minutes_ago": 80},
            {"sender": users[3], "content": "I found an amazing ramen place we HAVE to try", "minutes_ago": 75},
            {"sender": users[0], "content": "Add it to the trip! I'll vote yes 👍",          "minutes_ago": 70},
        ]

        for msg_data in messages_conv2:
            session.add(Message(
                content=msg_data["content"],
                sender_user_id=msg_data["sender"].id,
                receiver_user_id=None,  # group — no single receiver
                conversation_id=conv2.id,
                timestamp=datetime.now() - timedelta(minutes=msg_data["minutes_ago"])
            ))

        # Poll message — no votes yet
        session.add(Message(
            content="Which day should we visit Senso-ji Temple?",
            type=MessageType.POLL,
            meta_data={
                "options": {"April 16 (Morning)": [],
                 "April 17 (Afternoon)": [], 
                 "April 18 (Evening)": []},
                "expires_at": "2026-04-10T00:00:00"
            },
            sender_user_id=users[0].id,
            receiver_user_id=None,
            conversation_id=conv2.id,
            timestamp=datetime.now() - timedelta(minutes=65)
        ))

        session.commit()
        print(f"✓ Created {len(messages_conv1) + len(messages_conv2)} messages")

        # ════════════════════════════════════════════════════════
        # CREATE TRIPS
        # ════════════════════════════════════════════════════════
        print("Creating trips...")

        trips_data = [
            {
                "name": "Tokyo Adventure 2024",
                "description": "Exploring Tokyo's food, culture, and technology!",
                "user_id": users[0].id,
                "conversation_id": conv2.id,
                "start_date": datetime(2024, 4, 15),
                "end_date": datetime(2024, 4, 22)
            },
            {
                "name": "Paris Weekend",
                "description": "Quick getaway to the City of Light",
                "user_id": users[1].id,
                "conversation_id": conv1.id,
                "start_date": datetime(2024, 6, 1),
                "end_date": datetime(2024, 6, 3)
            },
            {
                "name": "Iceland Road Trip",
                "description": "Chasing waterfalls and northern lights",
                "user_id": users[0].id,
                "conversation_id": conv3.id,
                "start_date": datetime(2024, 9, 10),
                "end_date": datetime(2024, 9, 17)
            }
        ]

        trips = []
        for trip_data in trips_data:
            trip = Trip(**trip_data)
            session.add(trip)
            trips.append(trip)

        session.commit()
        for trip in trips:
            session.refresh(trip)

        print(f"✓ Created {len(trips)} trips")

        # ════════════════════════════════════════════════════════
        # CREATE EVENTS (Places to visit)
        # ════════════════════════════════════════════════════════
        print("Creating events...")

        tokyo_events = [
            {
                "title": "Senso-ji Temple",
                "description": "Ancient Buddhist temple in Asakusa",
                "trip_id": trips[0].id, "user_id": users[0].id,
                "start": datetime(2024, 4, 16, 9, 0),
                "end": datetime(2024, 4, 16, 11, 0),
                "location": {"place_id": "ChIJ8T1GpMGOGGARDYGSgpooDWw", "name": "Senso-ji Temple",
                              "latitude": 35.7148, "longitude": 139.7967,
                              "address": "2-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan"}
            },
            {
                "title": "Tsukiji Outer Market",
                "description": "Fresh sushi breakfast!",
                "trip_id": trips[0].id, "user_id": users[2].id,
                "start": datetime(2024, 4, 16, 6, 30),
                "end": datetime(2024, 4, 16, 8, 30),
                "location": {"place_id": "ChIJISz8NjyLGGAR5JBaOCZa4RQ", "name": "Tsukiji Outer Market",
                              "latitude": 35.6654, "longitude": 139.7707,
                              "address": "4 Chome Tsukiji, Chuo City, Tokyo 104-0045, Japan"}
            },
            {
                "title": "Tokyo Tower",
                "description": "Iconic landmark with amazing views",
                "trip_id": trips[0].id, "user_id": users[3].id,
                "start": datetime(2024, 4, 17, 14, 0),
                "end": datetime(2024, 4, 17, 16, 0),
                "location": {"place_id": "ChIJCewJkL2LGGARHS_m2NRpJKY", "name": "Tokyo Tower",
                              "latitude": 35.6586, "longitude": 139.7454,
                              "address": "4-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan"}
            },
            {
                "title": "Shibuya Crossing",
                "description": "World's busiest pedestrian crossing",
                "trip_id": trips[0].id, "user_id": users[0].id,
                "start": datetime(2024, 4, 18, 19, 0),
                "end": datetime(2024, 4, 18, 20, 30),
                "location": {"place_id": "ChIJp6kFt9eMGGARJ1vvvHHiPIg", "name": "Shibuya Crossing",
                              "latitude": 35.6595, "longitude": 139.7004,
                              "address": "2-2-1 Dogenzaka, Shibuya City, Tokyo 150-0043, Japan"}
            },
            {
                "title": "TeamLab Borderless",
                "description": "Digital art museum - mind blowing!",
                "trip_id": trips[0].id, "user_id": users[2].id,
                "start": datetime(2024, 4, 19, 11, 0),
                "end": datetime(2024, 4, 19, 14, 0),
                "location": {"place_id": "ChIJQSaJPauOGGARgPvT-4gEbYU", "name": "teamLab Borderless",
                              "latitude": 35.6246, "longitude": 139.7755,
                              "address": "1-3-8 Aomi, Koto City, Tokyo 135-0064, Japan"}
            },
        ]

        paris_events = [
            {
                "title": "Eiffel Tower",
                "description": "Classic Paris experience",
                "trip_id": trips[1].id, "user_id": users[1].id,
                "start": datetime(2024, 6, 1, 10, 0),
                "end": datetime(2024, 6, 1, 12, 30),
                "location": {"place_id": "ChIJLU7jZClu5kcR4PcOOO6p3I0", "name": "Eiffel Tower",
                              "latitude": 48.8584, "longitude": 2.2945,
                              "address": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France"}
            },
            {
                "title": "Louvre Museum",
                "description": "See the Mona Lisa!",
                "trip_id": trips[1].id, "user_id": users[1].id,
                "start": datetime(2024, 6, 2, 9, 0),
                "end": datetime(2024, 6, 2, 13, 0),
                "location": {"place_id": "ChIJD3uTd9hx5kcR1IQvGfr8dbk", "name": "Louvre Museum",
                              "latitude": 48.8606, "longitude": 2.3376,
                              "address": "Rue de Rivoli, 75001 Paris, France"}
            },
        ]

        all_events = tokyo_events + paris_events
        for event_data in all_events:
            session.add(Event(**event_data))

        session.commit()
        print(f"✓ Created {len(all_events)} events")

        # ════════════════════════════════════════════════════════
        # CREATE ALBUMS
        # ════════════════════════════════════════════════════════
        print("Creating albums...")

        albums_data = [
            {"name": "Tokyo Food Adventures", "trip_id": trips[0].id, "link": "https://photos.example.com/tokyo-food"},
            {"name": "Tokyo Temples",         "trip_id": trips[0].id, "link": "https://photos.example.com/tokyo-temples"},
            {"name": "Paris Memories",        "trip_id": trips[1].id, "link": "https://photos.example.com/paris"},
        ]

        for album_data in albums_data:
            session.add(Album(**album_data))

        session.commit()
        print(f"✓ Created {len(albums_data)} albums")

        # ════════════════════════════════════════════════════════
        # SUMMARY
        # ════════════════════════════════════════════════════════
        print("\n" + "=" * 50)
        print("DATABASE SEEDED SUCCESSFULLY!")
        print("=" * 50)
        print(f"Users:         {len(users)}")
        print(f"Conversations: {len(conversations)}")
        print(f"Messages:      {len(messages_conv1) + len(messages_conv2)}")
        print(f"Trips:         {len(trips)}")
        print(f"Events:        {len(all_events)}")
        print(f"Albums:        {len(albums_data)}")
        print("=" * 50)
        print("\nTest Credentials:")
        print("-" * 50)
        for user_data in users_data:
            print(f"  {user_data['username']:<10} | {user_data['email']:<25} | {user_data['password']}")
        print("=" * 50)