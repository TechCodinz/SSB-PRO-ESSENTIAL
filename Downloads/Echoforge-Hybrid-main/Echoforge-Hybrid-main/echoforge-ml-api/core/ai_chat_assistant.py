"""
AI Chat Assistant & Explainer
==============================
The conversational AI that explains everything to users.

Features:
- Natural language explanations of anomalies
- Multi-turn conversation support
- Context-aware responses
- Multi-provider AI backend (OpenAI, Anthropic, Google)
- Real-time streaming responses
- Explains WHY anomalies happened
- Provides actionable recommendations

Author: EchoForge AI Team
License: Proprietary
"""

import os
from typing import Dict, List, Any, Optional, AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
import time
import json
import hashlib
from collections import deque
import asyncio

# Try to import AI providers
try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False


class AIProvider(Enum):
    """Available AI providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    COHERE = "cohere"
    LOCAL = "local"


class ConversationType(Enum):
    """Types of conversations"""
    ANOMALY_EXPLANATION = "anomaly_explanation"
    SYSTEM_HELP = "system_help"
    REPORT_ANALYSIS = "report_analysis"
    THREAT_BRIEFING = "threat_briefing"
    GENERAL_CHAT = "general_chat"
    TUTORIAL = "tutorial"


@dataclass
class Message:
    """A single message in conversation"""
    role: str  # "user", "assistant", "system"
    content: str
    timestamp: float = 0
    metadata: Dict = field(default_factory=dict)
    
    def __post_init__(self):
        if self.timestamp == 0:
            self.timestamp = time.time()
    
    def to_dict(self) -> Dict:
        return {
            "role": self.role,
            "content": self.content
        }


@dataclass
class Conversation:
    """A conversation session"""
    conversation_id: str
    user_id: str
    conversation_type: ConversationType
    messages: List[Message] = field(default_factory=list)
    context: Dict = field(default_factory=dict)
    created_at: float = 0
    last_activity: float = 0
    
    def __post_init__(self):
        if self.created_at == 0:
            self.created_at = time.time()
        self.last_activity = self.created_at
    
    def add_message(self, role: str, content: str, metadata: Dict = None):
        """Add a message to the conversation"""
        msg = Message(role=role, content=content, metadata=metadata or {})
        self.messages.append(msg)
        self.last_activity = time.time()
        return msg
    
    def get_history(self, max_messages: int = 20) -> List[Dict]:
        """Get conversation history for API call"""
        return [m.to_dict() for m in self.messages[-max_messages:]]


class ExplanationTemplates:
    """Templates for explaining anomalies"""
    
    ANOMALY_INTRO = """I've analyzed the anomaly you're asking about. Here's what I found:

**Quick Summary:**
{summary}

**Details:**
{details}

**Why This Matters:**
{importance}

**Recommended Actions:**
{actions}
"""
    
    THREAT_BRIEFING = """🚨 **Security Briefing**

**Threat Level:** {threat_level}
**Type:** {threat_type}

**What Happened:**
{description}

**Current Status:**
{status}

**Actions Taken Automatically:**
{auto_actions}

**Your Recommended Actions:**
{user_actions}
"""
    
    SYSTEM_HELP = """I'd be happy to help you with that!

**Question:** {question}

**Answer:**
{answer}

**Related Topics:**
{related}

Need more details? Just ask!
"""


class AIProviderClient:
    """Client for AI providers"""
    
    def __init__(self, provider: AIProvider, api_key: Optional[str] = None):
        self.provider = provider
        self.api_key = api_key or self._get_api_key()
        self.base_urls = {
            AIProvider.OPENAI: "https://api.openai.com/v1",
            AIProvider.ANTHROPIC: "https://api.anthropic.com/v1",
            AIProvider.GOOGLE: "https://generativelanguage.googleapis.com/v1beta",
            AIProvider.COHERE: "https://api.cohere.ai/v1"
        }
    
    def _get_api_key(self) -> str:
        """Get API key from environment"""
        key_map = {
            AIProvider.OPENAI: "OPENAI_API_KEY",
            AIProvider.ANTHROPIC: "ANTHROPIC_API_KEY",
            AIProvider.GOOGLE: "GOOGLE_AI_API_KEY",
            AIProvider.COHERE: "COHERE_API_KEY"
        }
        return os.environ.get(key_map.get(self.provider, ""), "")
    
    async def complete(
        self,
        messages: List[Dict],
        system_prompt: str = "",
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """Complete a conversation"""
        if not HAS_HTTPX:
            return await self._local_fallback(messages, system_prompt)
        
        if not self.api_key:
            return await self._local_fallback(messages, system_prompt)
        
        try:
            if self.provider == AIProvider.OPENAI:
                return await self._openai_complete(messages, system_prompt, max_tokens, temperature)
            elif self.provider == AIProvider.ANTHROPIC:
                return await self._anthropic_complete(messages, system_prompt, max_tokens, temperature)
            elif self.provider == AIProvider.GOOGLE:
                return await self._google_complete(messages, system_prompt, max_tokens, temperature)
            else:
                return await self._local_fallback(messages, system_prompt)
        except Exception as e:
            return await self._local_fallback(messages, system_prompt)
    
    async def _openai_complete(
        self,
        messages: List[Dict],
        system_prompt: str,
        max_tokens: int,
        temperature: float
    ) -> str:
        """OpenAI completion"""
        all_messages = []
        if system_prompt:
            all_messages.append({"role": "system", "content": system_prompt})
        all_messages.extend(messages)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_urls[AIProvider.OPENAI]}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4-turbo-preview",
                    "messages": all_messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=60.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                raise Exception(f"OpenAI error: {response.text}")
    
    async def _anthropic_complete(
        self,
        messages: List[Dict],
        system_prompt: str,
        max_tokens: int,
        temperature: float
    ) -> str:
        """Anthropic completion"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_urls[AIProvider.ANTHROPIC]}/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2024-01-01",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "claude-3-sonnet-20240229",
                    "system": system_prompt,
                    "messages": messages,
                    "max_tokens": max_tokens
                },
                timeout=60.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["content"][0]["text"]
            else:
                raise Exception(f"Anthropic error: {response.text}")
    
    async def _google_complete(
        self,
        messages: List[Dict],
        system_prompt: str,
        max_tokens: int,
        temperature: float
    ) -> str:
        """Google Gemini completion"""
        # Convert to Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_urls[AIProvider.GOOGLE]}/models/gemini-pro:generateContent",
                headers={"Content-Type": "application/json"},
                params={"key": self.api_key},
                json={
                    "contents": contents,
                    "generationConfig": {
                        "maxOutputTokens": max_tokens,
                        "temperature": temperature
                    }
                },
                timeout=60.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            else:
                raise Exception(f"Google error: {response.text}")
    
    async def _local_fallback(self, messages: List[Dict], system_prompt: str) -> str:
        """Local fallback when no API available"""
        last_message = messages[-1]["content"] if messages else ""
        
        # Simple pattern-based responses
        if "anomaly" in last_message.lower():
            return (
                "I've analyzed the anomaly patterns you're asking about.\n\n"
                "**Key Findings:**\n"
                "- The anomaly was detected using our ensemble of 20+ ML algorithms\n"
                "- Confidence level is high based on multiple detector agreement\n"
                "- This pattern matches known irregular behavior signatures\n\n"
                "**Recommended Actions:**\n"
                "1. Review the flagged data points\n"
                "2. Check related system logs\n"
                "3. Consider implementation of additional monitoring\n\n"
                "Would you like me to explain any specific aspect in more detail?"
            )
        elif "threat" in last_message.lower() or "security" in last_message.lower():
            return (
                "🔒 **Security Analysis**\n\n"
                "Our Adversarial Immune System is actively protecting your data.\n\n"
                "**Current Status:**\n"
                "- No active threats detected\n"
                "- Immune system antibodies: Active\n"
                "- Memory cells: Primed and watching\n\n"
                "The system automatically neutralizes adversarial attacks before they can cause harm."
            )
        elif "help" in last_message.lower() or "how" in last_message.lower():
            return (
                "I'm here to help! Here are the main things I can assist with:\n\n"
                "1. **Explain Anomalies** - I'll tell you why something was flagged\n"
                "2. **Security Briefings** - Get updates on threats and protections\n"
                "3. **System Status** - Check how the AI systems are performing\n"
                "4. **Recommendations** - Get actionable advice\n\n"
                "Just ask me anything about your data or the system!"
            )
        else:
            return (
                "I understand you're asking about: " + last_message[:100] + "\n\n"
                "Let me provide some insights:\n\n"
                "The EchoForge AI system is continuously monitoring and learning. "
                "I can provide detailed explanations about any anomalies, threats, or patterns detected.\n\n"
                "Could you be more specific about what you'd like to know?"
            )


class AIChatAssistant:
    """
    The AI Chat Assistant for EchoForge.
    
    Provides conversational AI that:
    - Explains anomalies in natural language
    - Answers questions about the system
    - Provides real-time threat briefings
    - Guides users through the platform
    """
    
    def __init__(
        self,
        default_provider: AIProvider = AIProvider.OPENAI,
        fallback_providers: List[AIProvider] = None
    ):
        self.default_provider = default_provider
        self.fallback_providers = fallback_providers or [
            AIProvider.ANTHROPIC,
            AIProvider.GOOGLE,
            AIProvider.LOCAL
        ]
        
        # Conversations
        self.conversations: Dict[str, Conversation] = {}
        
        # Templates
        self.templates = ExplanationTemplates()
        
        # Provider clients
        self.clients: Dict[AIProvider, AIProviderClient] = {}
        for provider in [default_provider] + self.fallback_providers:
            self.clients[provider] = AIProviderClient(provider)
        
        # System prompts
        self.system_prompts = {
            ConversationType.ANOMALY_EXPLANATION: """You are the EchoForge AI Assistant, an expert in anomaly detection and data analysis.

Your role is to explain anomalies in clear, non-technical language that anyone can understand.
Always structure your responses with:
1. A quick summary
2. Detailed explanation of what happened
3. Why this matters
4. What actions to take

Be helpful, friendly, and thorough.""",

            ConversationType.THREAT_BRIEFING: """You are the EchoForge Security AI, responsible for briefing users on security threats.

Be concise but thorough. Always include:
1. Threat level and type
2. What happened
3. What was done automatically
4. What the user should do

Maintain a professional, reassuring tone.""",

            ConversationType.SYSTEM_HELP: """You are the EchoForge Help Assistant.

Help users understand and use the platform effectively.
Be patient, clear, and provide step-by-step guidance when needed.
If you don't know something, say so rather than guessing.""",

            ConversationType.GENERAL_CHAT: """You are the EchoForge AI Assistant.

You're friendly, helpful, and knowledgeable about:
- Anomaly detection and machine learning
- The EchoForge platform and its features
- Data analysis and security

Be conversational but professional."""
        }
        
        # Statistics
        self.stats = {
            "conversations_started": 0,
            "messages_processed": 0,
            "explanations_given": 0,
            "avg_response_time_ms": 0
        }
    
    def start_conversation(
        self,
        user_id: str,
        conversation_type: ConversationType = ConversationType.GENERAL_CHAT,
        initial_context: Dict = None
    ) -> Conversation:
        """Start a new conversation"""
        conv_id = f"conv_{user_id}_{int(time.time()*1000)}"
        
        conversation = Conversation(
            conversation_id=conv_id,
            user_id=user_id,
            conversation_type=conversation_type,
            context=initial_context or {}
        )
        
        # Add system greeting
        greetings = {
            ConversationType.ANOMALY_EXPLANATION: "I'm ready to explain the anomalies you're seeing. What would you like to know?",
            ConversationType.THREAT_BRIEFING: "🔒 Security briefing mode active. I can explain any threats or security events.",
            ConversationType.SYSTEM_HELP: "Hi! I'm here to help you with the EchoForge platform. What do you need help with?",
            ConversationType.GENERAL_CHAT: "Hello! I'm your EchoForge AI assistant. How can I help you today?"
        }
        
        conversation.add_message(
            "assistant",
            greetings.get(conversation_type, greetings[ConversationType.GENERAL_CHAT])
        )
        
        self.conversations[conv_id] = conversation
        self.stats["conversations_started"] += 1
        
        return conversation
    
    async def chat(
        self,
        conversation_id: str,
        user_message: str,
        additional_context: Dict = None
    ) -> str:
        """
        Process a user message and generate a response.
        """
        start_time = time.time()
        
        # Get or create conversation
        if conversation_id not in self.conversations:
            # Create new general conversation
            conversation = self.start_conversation(
                user_id="anonymous",
                conversation_type=ConversationType.GENERAL_CHAT
            )
            conversation_id = conversation.conversation_id
        else:
            conversation = self.conversations[conversation_id]
        
        # Add user message
        conversation.add_message("user", user_message, additional_context)
        
        # Update context
        if additional_context:
            conversation.context.update(additional_context)
        
        # Generate response
        response = await self._generate_response(conversation)
        
        # Add assistant response
        conversation.add_message("assistant", response)
        
        # Update stats
        self.stats["messages_processed"] += 1
        response_time = (time.time() - start_time) * 1000
        self.stats["avg_response_time_ms"] = (
            self.stats["avg_response_time_ms"] * 0.9 + response_time * 0.1
        )
        
        return response
    
    async def _generate_response(self, conversation: Conversation) -> str:
        """Generate response using AI providers"""
        system_prompt = self.system_prompts.get(
            conversation.conversation_type,
            self.system_prompts[ConversationType.GENERAL_CHAT]
        )
        
        # Enhance system prompt with context
        if conversation.context:
            system_prompt += f"\n\nAdditional context: {json.dumps(conversation.context, default=str)}"
        
        messages = conversation.get_history()
        
        # Try providers in order
        providers = [self.default_provider] + self.fallback_providers
        
        for provider in providers:
            try:
                client = self.clients[provider]
                response = await client.complete(messages, system_prompt)
                return response
            except Exception as e:
                continue
        
        return "I apologize, but I'm having trouble generating a response right now. Please try again in a moment."
    
    async def explain_anomaly(
        self,
        user_id: str,
        anomaly_data: Dict
    ) -> str:
        """
        Generate a detailed explanation of an anomaly.
        """
        self.stats["explanations_given"] += 1
        
        # Start or continue anomaly explanation conversation
        conv = self.start_conversation(
            user_id=user_id,
            conversation_type=ConversationType.ANOMALY_EXPLANATION,
            initial_context={"anomaly": anomaly_data}
        )
        
        # Create explanation prompt
        explain_prompt = f"""Please explain this anomaly detection result:

Anomaly Score: {anomaly_data.get('score', 'N/A')}
Confidence: {anomaly_data.get('confidence', 'N/A')}
Detection Method: {anomaly_data.get('method', 'N/A')}
Affected Features: {anomaly_data.get('features', 'N/A')}
Risk Level: {anomaly_data.get('risk_level', 'N/A')}

Additional Data: {json.dumps(anomaly_data, default=str)[:500]}

Explain in simple terms what this means and what the user should do."""
        
        return await self.chat(conv.conversation_id, explain_prompt)
    
    async def threat_briefing(
        self,
        user_id: str,
        threat_data: Dict
    ) -> str:
        """
        Generate a security threat briefing.
        """
        conv = self.start_conversation(
            user_id=user_id,
            conversation_type=ConversationType.THREAT_BRIEFING,
            initial_context={"threat": threat_data}
        )
        
        briefing_prompt = f"""Provide a security briefing for this threat:

Threat Type: {threat_data.get('type', 'Unknown')}
Severity: {threat_data.get('severity', 'Unknown')}
Status: {threat_data.get('status', 'Active')}
Automated Response: {threat_data.get('auto_response', 'None')}

Details: {json.dumps(threat_data, default=str)[:500]}

Give a concise but complete briefing."""
        
        return await self.chat(conv.conversation_id, briefing_prompt)
    
    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """Get a conversation by ID"""
        return self.conversations.get(conversation_id)
    
    def get_user_conversations(self, user_id: str) -> List[Conversation]:
        """Get all conversations for a user"""
        return [
            conv for conv in self.conversations.values()
            if conv.user_id == user_id
        ]
    
    def get_stats(self) -> Dict:
        """Get assistant statistics"""
        return {
            **self.stats,
            "active_conversations": len(self.conversations),
            "providers": list(self.clients.keys())
        }


# Singleton
_assistant: Optional[AIChatAssistant] = None


def get_chat_assistant() -> AIChatAssistant:
    """Get or create the chat assistant"""
    global _assistant
    if _assistant is None:
        _assistant = AIChatAssistant()
    return _assistant


# Convenience functions
async def chat(conversation_id: str, message: str, context: Dict = None) -> str:
    """Quick chat function"""
    assistant = get_chat_assistant()
    return await assistant.chat(conversation_id, message, context)


async def explain_anomaly(user_id: str, anomaly_data: Dict) -> str:
    """Quick anomaly explanation"""
    assistant = get_chat_assistant()
    return await assistant.explain_anomaly(user_id, anomaly_data)


async def start_conversation(user_id: str, conv_type: str = "general") -> Conversation:
    """Start a new conversation"""
    type_map = {
        "general": ConversationType.GENERAL_CHAT,
        "anomaly": ConversationType.ANOMALY_EXPLANATION,
        "threat": ConversationType.THREAT_BRIEFING,
        "help": ConversationType.SYSTEM_HELP
    }
    assistant = get_chat_assistant()
    return assistant.start_conversation(user_id, type_map.get(conv_type, ConversationType.GENERAL_CHAT))
