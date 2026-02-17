import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from datetime import datetime, timedelta

from main import app
from database.models import User, Message, Conversation, UserConversationLink
from database.session import get_session
from auth.auth_handler import create_access_token, get_password_hash


@pytest.fixture(name="session")
def session_fixture():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client with the test database."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """Create a test user."""
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123")
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="test_user2")
def test_user2_fixture(session: Session):
    """Create a second test user for conversation tests."""
    user = User(
        username="testuser2",
        email="test2@example.com",
        hashed_password=get_password_hash("testpassword123")
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="auth_token")
def auth_token_fixture(test_user: User):
    """Create an authentication token for the test user."""
    access_token_expires = timedelta(minutes=30)
    return create_access_token(
        data={"sub": test_user.email},
        expires_delta=access_token_expires
    )


@pytest.fixture(name="test_conversation")
def test_conversation_fixture(session: Session, test_user: User, test_user2: User):
    """Create a test conversation with multiple users."""
    conversation = Conversation()
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    
    # Add users to conversation
    link1 = UserConversationLink(user_id=test_user.id, conversation_id=conversation.id)
    link2 = UserConversationLink(user_id=test_user2.id, conversation_id=conversation.id)
    session.add(link1)
    session.add(link2)
    session.commit()
    
    return conversation


class TestSendMessage:
    """Test cases for send_message endpoint."""

    def test_send_message_success(self, client: TestClient, auth_token: str, test_user: User):
        """Test successful message creation."""
        message_data = {
            "content": "Hello, this is a test message!",
            "sender_user_id": test_user.id,
            "reciever_user_id": test_user.id,
            "timestamp": datetime.now().isoformat()
        }
        response = client.post(
            "/send",
            json=message_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Hello, this is a test message!"
        assert data["sender_user_id"] == test_user.id

    def test_send_message_without_auth(self, client: TestClient, test_user: User):
        """Test sending message without authentication."""
        message_data = {
            "content": "Hello, this is a test message!",
            "sender_user_id": test_user.id,
            "reciever_user_id": test_user.id,
            "timestamp": datetime.now().isoformat()
        }
        response = client.post("/send", json=message_data)
        assert response.status_code == 403

    def test_send_message_with_invalid_token(self, client: TestClient, test_user: User):
        """Test sending message with invalid token."""
        message_data = {
            "content": "Hello, this is a test message!",
            "sender_user_id": test_user.id,
            "reciever_user_id": test_user.id,
            "timestamp": datetime.now().isoformat()
        }
        response = client.post(
            "/send",
            json=message_data,
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_send_message_missing_content(self, client: TestClient, auth_token: str, test_user: User):
        """Test sending message without content."""
        message_data = {
            "sender_user_id": test_user.id,
            "reciever_user_id": test_user.id,
            "timestamp": datetime.now().isoformat()
        }
        response = client.post(
            "/send",
            json=message_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 422

    def test_send_message_sender_id_overwritten(self, client: TestClient, auth_token: str, test_user: User, test_user2: User):
        """Test that sender_user_id is overwritten with current user."""
        message_data = {
            "content": "Test message",
            "sender_user_id": test_user2.id,
            "reciever_user_id": test_user2.id,
            "timestamp": datetime.now().isoformat()
        }
        response = client.post(
            "/send",
            json=message_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Sender should be the authenticated user, not the provided sender_user_id
        assert data["sender_user_id"] == test_user.id


class TestCreateConversation:
    """Test cases for create_conversation endpoint."""

    def test_create_conversation_success(self, client: TestClient, auth_token: str, test_user: User):
        """Test successful conversation creation."""
        conversation_data = {}
        response = client.post(
            "/conversation",
            json=conversation_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_create_conversation_without_auth(self, client: TestClient):
        """Test creating conversation without authentication."""
        conversation_data = {}
        response = client.post("/conversation", json=conversation_data)
        assert response.status_code == 403

    def test_create_conversation_with_invalid_token(self, client: TestClient):
        """Test creating conversation with invalid token."""
        conversation_data = {}
        response = client.post(
            "/conversation",
            json=conversation_data,
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_create_conversation_includes_current_user(self, client: TestClient, auth_token: str, test_user: User, session: Session):
        """Test that current user is added to conversation."""
        conversation_data = {}
        response = client.post(
            "/conversation",
            json=conversation_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify user is in conversation
        conversation_id = data["id"]
        conversation = session.query(Conversation).filter(Conversation.id == conversation_id).first()
        user_ids = [user.id for user in conversation.users]
        assert test_user.id in user_ids


class TestGetConversation:
    """Test cases for get_conversation endpoint."""

    def test_get_conversation_success(self, client: TestClient, auth_token: str, test_conversation: Conversation, session: Session):
        """Test successful retrieval of conversation messages."""
        response = client.get(
            f"/conversation/{test_conversation.id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_conversation_with_messages(self, client: TestClient, auth_token: str, test_user: User, test_conversation: Conversation, session: Session):
        """Test retrieving conversation with messages."""
        # Add a message to the conversation
        message = Message(
            content="Test message",
            sender_user_id=test_user.id,
            reciever_user_id=test_user.id,
            conversation_id=test_conversation.id,
            timestamp=datetime.now()
        )
        session.add(message)
        session.commit()
        
        response = client.get(
            f"/conversation/{test_conversation.id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["content"] == "Test message"

    def test_get_conversation_not_found(self, client: TestClient, auth_token: str):
        """Test retrieving non-existent conversation."""
        response = client.get(
            "/conversation/9999",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_conversation_unauthorized(self, client: TestClient, auth_token: str, session: Session):
        """Test accessing conversation without permission."""
        # Create a conversation with only test_user2
        user2 = User(
            username="otheruser",
            email="other@example.com",
            hashed_password=get_password_hash("password123")
        )
        session.add(user2)
        session.commit()
        session.refresh(user2)
        
        conversation = Conversation()
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        
        link = UserConversationLink(user_id=user2.id, conversation_id=conversation.id)
        session.add(link)
        session.commit()
        
        # Try to access with different user's token
        response = client.get(
            f"/conversation/{conversation.id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 403
        assert "not authorized" in response.json()["detail"].lower()

    def test_get_conversation_without_auth(self, client: TestClient, test_conversation: Conversation):
        """Test accessing conversation without authentication."""
        response = client.get(f"/conversation/{test_conversation.id}")
        assert response.status_code == 403

    def test_get_conversation_with_invalid_token(self, client: TestClient, test_conversation: Conversation):
        """Test accessing conversation with invalid token."""
        response = client.get(
            f"/conversation/{test_conversation.id}",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_get_empty_conversation(self, client: TestClient, auth_token: str, test_conversation: Conversation):
        """Test retrieving conversation with no messages."""
        response = client.get(
            f"/conversation/{test_conversation.id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0
