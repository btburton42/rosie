"""Tests for Rosie storage service."""

import pytest
from datetime import datetime
from src.services.storage import StorageService, Conversation


@pytest.fixture
def storage():
    """Create a fresh storage instance for each test."""
    return StorageService.getInstance()


@pytest.fixture
def sample_conversation():
    """Create a sample conversation for testing."""
    return Conversation(
        id="test-123",
        messages=[],
        modelId="nvidia/Kimi-K2.5-NVFP4",
        title="Test Chat",
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )


class TestStorageService:
    """Test cases for StorageService."""
    
    def test_singleton_pattern(self, storage):
        """Ensure StorageService is a singleton."""
        instance2 = StorageService.getInstance()
        assert storage is instance2
    
    def test_get_settings_returns_defaults(self, storage):
        """Test that getSettings returns default settings when none exist."""
        settings = storage.getSettings()
        
        assert settings.theme == "rosie"
        assert settings.fontSize == "medium"
        assert settings.apiToken is None
        assert settings.selectedModelId != ""
    
    def test_save_and_retrieve_conversation(self, storage, sample_conversation):
        """Test saving and retrieving a conversation."""
        # Clear existing conversations
        storage.clearAll()
        
        # Save conversation
        storage.saveConversation(sample_conversation)
        
        # Retrieve
        conversations = storage.getConversations()
        assert len(conversations) == 1
        assert conversations[0].id == "test-123"
        assert conversations[0].title == "Test Chat"
    
    def test_delete_conversation(self, storage, sample_conversation):
        """Test deleting a conversation."""
        storage.clearAll()
        storage.saveConversation(sample_conversation)
        
        # Delete
        storage.deleteConversation("test-123")
        
        # Verify deleted
        conversations = storage.getConversations()
        assert len(conversations) == 0
    
    def test_update_conversation(self, storage, sample_conversation):
        """Test updating an existing conversation."""
        storage.clearAll()
        storage.saveConversation(sample_conversation)
        
        # Update title
        sample_conversation.title = "Updated Title"
        storage.saveConversation(sample_conversation)
        
        # Verify update
        conversations = storage.getConversations()
        assert len(conversations) == 1
        assert conversations[0].title == "Updated Title"
