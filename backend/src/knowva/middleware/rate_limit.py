"""Rate limiting middleware using slowapi."""

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from knowva.config import settings


def get_rate_limit_key(request: Request) -> str:
    """認証済みユーザーはトークンベース、未認証はIPアドレスでレート制限。"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        return f"user:{token[:32]}"
    return get_remote_address(request)


limiter = Limiter(key_func=get_rate_limit_key, default_limits=[settings.rate_limit_default])
