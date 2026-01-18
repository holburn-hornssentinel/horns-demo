"""
Onyx API Client for HornsIQ

Provides connectivity to Onyx for RAG-powered responses.
"""
import os
import json
import httpx
from typing import List, Dict, Any, Optional


class OnyxClient:
    """Client for interacting with Onyx API."""

    def __init__(self):
        self.api_url = os.getenv('ONYX_API_URL', 'http://welcometocostco:8080')
        self.api_key = os.getenv('ONYX_API_KEY', '')
        self.timeout = 60.0
        self.sessions = {}  # Store session IDs for conversations

    async def _create_session(self, persona_id: int = 0) -> Optional[str]:
        """
        Create a new chat session in Onyx.

        Args:
            persona_id: Persona to use for the session

        Returns:
            Session ID or None if failed
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = f"{self.api_url}/api/chat/create-chat-session"

                headers = {'Content-Type': 'application/json'}
                if self.api_key:
                    headers['Authorization'] = f'Bearer {self.api_key}'

                payload = {'persona_id': persona_id}

                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()

                data = response.json()
                return data.get('chat_session_id')

        except Exception:
            return None

    async def chat(
        self,
        message: str,
        persona_id: int = 0,
        conversation_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Send a chat message to Onyx and get a response.

        Args:
            message: User message
            persona_id: Persona to use (0 = default)
            conversation_id: Optional conversation ID for context

        Returns:
            Dict containing response and metadata
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Get or create session ID
                session_key = f"{persona_id}_{conversation_id}" if conversation_id else str(persona_id)

                if session_key not in self.sessions:
                    session_id = await self._create_session(persona_id)
                    if not session_id:
                        raise Exception("Failed to create chat session")
                    self.sessions[session_key] = session_id
                else:
                    session_id = self.sessions[session_key]

                # Onyx chat endpoint
                url = f"{self.api_url}/api/chat/send-message"

                headers = {'Content-Type': 'application/json'}
                if self.api_key:
                    headers['Authorization'] = f'Bearer {self.api_key}'

                payload = {
                    'chat_session_id': session_id,
                    'parent_message_id': None,
                    'message': message,
                    'search_doc_ids': None,
                    'retrieval_options': {
                        'run_search': 'always',
                        'real_time': True
                    }
                }

                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()

                # Parse streaming response
                response_text = response.text
                lines = response_text.strip().split('\n')

                answer_text = ''
                sources = []
                user_message_id = None

                for line in lines:
                    try:
                        data = json.loads(line)

                        # Extract user_message_id from first response
                        if 'user_message_id' in data:
                            user_message_id = data['user_message_id']

                        # Parse streaming objects
                        if 'obj' in data:
                            obj = data['obj']
                            obj_type = obj.get('type', '')

                            # Collect answer text from message deltas
                            if obj_type == 'message_delta':
                                answer_text += obj.get('content', '')

                            # Collect citations
                            elif obj_type == 'citation_delta':
                                doc = obj.get('document', {})
                                if doc:
                                    sources.append({
                                        'title': doc.get('semantic_identifier', 'Unknown'),
                                        'link': doc.get('link', ''),
                                        'blurb': doc.get('blurb', '')
                                    })
                    except:
                        continue

                return {
                    'success': True,
                    'message': answer_text if answer_text else 'No response received.',
                    'sources': sources,
                    'conversation_id': user_message_id
                }

        except httpx.RequestError as e:
            return {
                'success': False,
                'error': f'Connection error: {str(e)}',
                'message': 'Unable to connect to HornsIQ knowledge base. Using fallback response.',
            }
        except httpx.HTTPStatusError as e:
            return {
                'success': False,
                'error': f'HTTP error: {e.response.status_code}',
                'message': 'Error communicating with HornsIQ. Please try again.',
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'An unexpected error occurred.',
            }

    async def search(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """
        Search the Onyx knowledge base.

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            Dict containing search results
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = f"{self.api_url}/api/query"

                headers = {}
                if self.api_key:
                    headers['Authorization'] = f'Bearer {self.api_key}'

                payload = {
                    'query': query,
                    'limit': limit,
                }

                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()

                data = response.json()

                return {
                    'success': True,
                    'results': data.get('results', []),
                }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'results': [],
            }

    def get_personas(self) -> List[Dict[str, Any]]:
        """
        Get available Onyx personas.

        Returns:
            List of personas
        """
        # For demo purposes, return hardcoded personas
        # In production, this would query the Onyx API
        return [
            {
                'id': 0,
                'name': 'General Assistant',
                'description': 'General-purpose security assistant with access to all knowledge',
            },
            {
                'id': 1,
                'name': 'Security Analyst',
                'description': 'Focused on threat analysis and incident response',
            },
            {
                'id': 2,
                'name': 'Compliance Expert',
                'description': 'Specializes in security compliance and regulations',
            },
        ]
