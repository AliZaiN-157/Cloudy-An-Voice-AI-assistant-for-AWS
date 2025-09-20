"""
Gemini Live API connector for real-time voice AI assistant functionality.
"""

import asyncio
import base64
import json
import time
from typing import Optional, Dict, Any, Callable, AsyncGenerator
from loguru import logger
import google.generativeai as genai
from google.generativeai.types import GenerateContentResponse
from ..core.config import settings


class GeminiLiveConnector:
    """Connector for Google Gemini Live API with real-time capabilities."""
    
    def __init__(self):
        """Initialize the Gemini Live connector."""
        self.api_key = settings.gemini_api_key
        self.model_name = settings.gemini_model
        self.genai_model = None
        self.session = None
        self.is_connected = False
        self.logger = logger.bind(name="GeminiLiveConnector")
        
        # Configure the API
        genai.configure(api_key=self.api_key)
        
    async def initialize(self) -> None:
        """Initialize the Gemini model and session."""
        try:
            self.genai_model = genai.GenerativeModel(self.model_name)
            self.logger.info(f"Initialized Gemini model: {self.model_name}")
        except Exception as e:
            self.logger.error(f"Failed to initialize Gemini model: {e}")
            raise
    
    async def start_session(self, session_id: str, user_id: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Start a new conversation session."""
        try:
            # Create session configuration
            session_config = {
                "session_id": session_id,
                "user_id": user_id,
                "model": self.model_name,
                "created_at": time.time(),
                "config": config or {}
            }
            
            # Initialize conversation history
            self.session = {
                "id": session_id,
                "user_id": user_id,
                "history": [],
                "config": config or {},
                "start_time": time.time(),
                "status": "active"
            }
            
            self.is_connected = True
            self.logger.info(f"Started session {session_id} for user {user_id}")
            
            # Generate initial greeting
            greeting_content = [
                {
                    "text": "You are Cloudy, a helpful AWS expert AI assistant. "
                            "You are having a voice conversation with a user while watching their screen. "
                            "Your primary goal is to provide clear, accurate, and concise verbal guidance on AWS services. "
                            "Start with a friendly greeting and ask how you can help them with their AWS console. "
                            "Keep your response natural and conversational, suitable for voice interaction. "
                            "Do not include markdown or code formatting in your response."
                }
            ]
            
            greeting_response = await self._generate_content(greeting_content)
            greeting_text = ""
            if greeting_response and greeting_response.text:
                greeting_text = greeting_response.text
                # Add greeting to session history
                self.session["history"].append({
                    "type": "assistant_greeting",
                    "content": greeting_text,
                    "timestamp": float(time.time()),
                    "session_id": session_id
                })
            
            # Create result with safe serialization
            result = {
                "status": "success",
                "session_id": session_id,
                "message": "Session started successfully",
                "greeting": greeting_text or "Hello! I'm Cloudy, your AWS assistant. How can I help you today?"
            }
            
            # Use safe serialization to validate
            try:
                self._safe_json_serialize(result)
            except Exception as e:
                self.logger.error(f"JSON serialization error: {e}")
                # Fallback to safe values
                result = {
                    "status": "success",
                    "session_id": session_id,
                    "message": "Session started successfully",
                    "greeting": "Hello! I'm Cloudy, your AWS assistant. How can I help you today?"
                }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Failed to start session {session_id}: {e}")
            raise
    
    async def process_audio_input(self, audio_data: str, session_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process audio input and generate response."""
        try:
            if not self.is_connected or not self.session:
                raise ValueError("No active session")
            
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            
            # Create content parts for the model
            content_parts = [
                {
                    "text": "You are a helpful AI assistant that provides step-by-step guidance to users. "
                            "Respond naturally and conversationally, focusing on being helpful and clear. "
                            "Keep responses concise but informative."
                },
                {
                    "inline_data": {
                        "mime_type": "audio/wav",
                        "data": audio_data
                    }
                }
            ]
            
            # Generate response using Gemini
            response = await self._generate_content(content_parts)
            
            # Process the response
            if response and response.text:
                # Add to session history
                self.session["history"].append({
                    "type": "user_audio",
                    "timestamp": float(time.time()),
                    "session_id": session_id
                })
                
                self.session["history"].append({
                    "type": "assistant_text",
                    "content": response.text,
                    "timestamp": float(time.time()),
                    "session_id": session_id
                })
                
                # Yield text response
                yield {
                    "type": "text_response",
                    "content": response.text,
                    "session_id": session_id,
                    "timestamp": float(time.time())
                }
                
                # TODO: Convert text to speech using Gemini's TTS capabilities
                # For now, we'll return the text and let the client handle TTS
                yield {
                    "type": "audio_response",
                    "content": "",  # Placeholder for audio data
                    "session_id": session_id,
                    "timestamp": float(time.time()),
                    "note": "Text-to-speech conversion to be implemented"
                }
            
        except Exception as e:
            self.logger.error(f"Error processing audio input: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "session_id": session_id,
                "timestamp": float(time.time())
            }
    
    async def process_screen_share(self, image_data: str, session_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Process screen share frame and provide context-aware response."""
        try:
            if not self.is_connected or not self.session:
                raise ValueError("No active session")
            
            # Create content parts with image
            content_parts = [
                {
                    "text": "You are a helpful AI assistant that analyzes screen content and provides guidance. "
                            "Look at the screen content and provide helpful, step-by-step instructions "
                            "based on what you see. Be specific and actionable."
                },
                {
                    "inline_data": {
                        "mime_type": "image/png",
                        "data": image_data
                    }
                }
            ]
            
            # Generate response using Gemini
            response = await self._generate_content(content_parts)
            
            if response and response.text:
                # Add to session history
                self.session["history"].append({
                    "type": "screen_share",
                    "timestamp": float(time.time()),
                    "session_id": session_id
                })
                
                self.session["history"].append({
                    "type": "assistant_text",
                    "content": response.text,
                    "timestamp": float(time.time()),
                    "session_id": session_id
                })
                
                # Yield text response
                yield {
                    "type": "text_response",
                    "content": response.text,
                    "session_id": session_id,
                    "timestamp": float(time.time())
                }
                
        except Exception as e:
            self.logger.error(f"Error processing screen share: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "session_id": session_id,
                "timestamp": float(time.time())
            }
    
    async def _generate_content(self, content_parts: list) -> Optional[GenerateContentResponse]:
        """Generate content using the Gemini model."""
        try:
            response = await asyncio.to_thread(
                self.genai_model.generate_content,
                content_parts,
                stream=False
            )
            return response
        except Exception as e:
            self.logger.error(f"Error generating content: {e}")
            raise

    def _safe_json_serialize(self, obj):
        """Safely serialize objects to JSON, handling datetime and other non-serializable types."""
        import json
        from datetime import datetime
        
        def convert(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            elif hasattr(obj, '__dict__'):
                return obj.__dict__
            elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
                if isinstance(obj, dict):
                    return {k: convert(v) for k, v in obj.items()}
                else:
                    return [convert(item) for item in obj]
            else:
                return obj
        
        try:
            converted = convert(obj)
            # Test serialization
            json.dumps(converted)
            return converted
        except (TypeError, ValueError) as e:
            self.logger.error(f"JSON serialization error: {e}")
            # Return a safe fallback
            return {"text": str(obj) if obj else ""}

    def _serialize_response(self, response: GenerateContentResponse) -> Dict[str, Any]:
        """Serialize Gemini response to JSON-safe format."""
        try:
            return {
                "text": response.text,
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {
                                    "text": part.text if hasattr(part, 'text') else str(part)
                                } for part in candidate.content.parts
                            ]
                        }
                    } for candidate in response.candidates
                ] if response.candidates else [],
                "usage_metadata": {
                    "prompt_token_count": response.usage_metadata.prompt_token_count if response.usage_metadata else 0,
                    "candidates_token_count": response.usage_metadata.candidates_token_count if response.usage_metadata else 0,
                    "total_token_count": response.usage_metadata.total_token_count if response.usage_metadata else 0
                } if response.usage_metadata else {}
            }
        except Exception as e:
            self.logger.error(f"Error serializing response: {e}")
            return {"text": response.text if response else ""}
    
    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """End the current session."""
        try:
            if self.session and self.session["id"] == session_id:
                self.session["status"] = "ended"
                self.session["end_time"] = time.time()
                self.is_connected = False
                
                self.logger.info(f"Ended session {session_id}")
                
                return {
                    "status": "success",
                    "session_id": session_id,
                    "message": "Session ended successfully",
                    "duration": float(self.session["end_time"] - self.session["start_time"])
                }
            else:
                raise ValueError(f"Session {session_id} not found or already ended")
                
        except Exception as e:
            self.logger.error(f"Error ending session {session_id}: {e}")
            raise
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get information about the current session."""
        if self.session and self.session["id"] == session_id:
            # Ensure all values are JSON serializable
            session_info = {
                "session_id": session_id,
                "user_id": self.session["user_id"],
                "status": self.session["status"],
                "start_time": float(self.session["start_time"]),
                "history_count": len(self.session["history"]),
                "config": self.session["config"]
            }
            
            # Add end_time if it exists
            if self.session.get("end_time"):
                session_info["end_time"] = float(self.session["end_time"])
            
            return session_info
        return None
    
    def get_session_history(self, session_id: str) -> list:
        """Get the conversation history for a session."""
        if self.session and self.session["id"] == session_id:
            # Ensure all timestamps are JSON serializable
            history = []
            for entry in self.session["history"]:
                serialized_entry = entry.copy()
                if "timestamp" in serialized_entry:
                    serialized_entry["timestamp"] = float(serialized_entry["timestamp"])
                history.append(serialized_entry)
            return history
        return []
    
    def is_session_active(self, session_id: str) -> bool:
        """Check if a session is active."""
        return (self.session and 
                self.session["id"] == session_id and 
                self.session["status"] == "active") 