"""
Onyx API Client for HornsIQ

Provides connectivity to Onyx for RAG-powered responses.
"""
import os
import httpx
from typing import List, Dict, Any, Optional


class OnyxClient:
    """Client for interacting with Onyx API."""

    def __init__(self):
        self.api_url = os.getenv('ONYX_API_URL', 'http://welcometocostco:8080')
        self.api_key = os.getenv('ONYX_API_KEY', '')
        self.timeout = 60.0

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
                # Onyx chat endpoint
                url = f"{self.api_url}/api/chat/send-message"

                headers = {}
                if self.api_key:
                    headers['Authorization'] = f'Bearer {self.api_key}'

                payload = {
                    'message': message,
                    'persona_id': persona_id,
                }

                if conversation_id:
                    payload['conversation_id'] = conversation_id

                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()

                data = response.json()

                return {
                    'success': True,
                    'message': data.get('answer', data.get('message', 'No response')),
                    'sources': data.get('citations', []),
                    'conversation_id': data.get('conversation_id')
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
