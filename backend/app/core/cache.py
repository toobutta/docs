import redis.asyncio as redis
import json
import hashlib
from typing import Optional, Any
from .config import settings


class CacheService:
    def __init__(self):
        self.client: Optional[redis.Redis] = None

    async def connect(self):
        """Connect to Redis/Valkey"""
        self.client = await redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )

    async def disconnect(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.client:
            return None

        value = await self.client.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(self, key: str, value: Any, ttl: int):
        """Set value in cache with TTL"""
        if not self.client:
            return

        await self.client.setex(
            key,
            ttl,
            json.dumps(value, default=str)
        )

    async def delete(self, key: str):
        """Delete key from cache"""
        if not self.client:
            return

        await self.client.delete(key)

    async def clear_pattern(self, pattern: str):
        """Clear all keys matching pattern"""
        if not self.client:
            return

        keys = await self.client.keys(pattern)
        if keys:
            await self.client.delete(*keys)

    def generate_cache_key(self, prefix: str, **kwargs) -> str:
        """Generate cache key from parameters"""
        params_str = json.dumps(kwargs, sort_keys=True, default=str)
        params_hash = hashlib.md5(params_str.encode()).hexdigest()
        return f"{prefix}:{params_hash}"


# Global cache instance
cache = CacheService()
