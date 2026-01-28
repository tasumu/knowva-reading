"""Mentor Agent API Router."""

import logging
from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Request
from google.adk.runners import Runner
from google.genai import types
from pydantic import BaseModel

from knowva.agents import mentor_agent
from knowva.config import settings
from knowva.middleware.firebase_auth import get_current_user
from knowva.middleware.rate_limit import limiter
from knowva.services import firestore
from knowva.services.session_service import get_session_service

logger = logging.getLogger(__name__)

router = APIRouter()

APP_NAME = "knowva_mentor"


# --- Request / Response Models ---


class MentorChatRequest(BaseModel):
    """メンターチャットリクエスト。"""

    message: str
    feedback_type: Optional[Literal["weekly", "monthly"]] = "weekly"


class MentorChatResponse(BaseModel):
    """メンターチャットレスポンス。"""

    id: str
    role: str
    message: str
    created_at: datetime


class MentorFeedbackResponse(BaseModel):
    """メンターフィードバックレスポンス。"""

    id: str
    feedback_type: str
    content: str
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    created_at: datetime


# --- Helpers ---


def get_mentor_runner() -> Runner:
    """メンターエージェント用のADK Runnerを取得する。"""
    return Runner(
        agent=mentor_agent,
        app_name=APP_NAME,
        session_service=get_session_service(),
    )


# --- Endpoints ---


@router.get("/feedbacks", response_model=list[MentorFeedbackResponse])
async def list_mentor_feedbacks(
    limit: int = 10,
    user: dict = Depends(get_current_user),
):
    """メンターフィードバック一覧を取得する。"""
    feedbacks = await firestore.list_mentor_feedbacks(user["uid"], limit=limit)
    return feedbacks


@router.get("/feedbacks/latest", response_model=Optional[MentorFeedbackResponse])
async def get_latest_mentor_feedback(
    user: dict = Depends(get_current_user),
):
    """最新のメンターフィードバックを取得する。"""
    feedback = await firestore.get_latest_mentor_feedback(user["uid"])
    return feedback


@router.post("/chat", response_model=MentorChatResponse)
@limiter.limit(settings.rate_limit_ai_endpoints)
async def chat_with_mentor(
    request: Request,
    body: MentorChatRequest,
    user: dict = Depends(get_current_user),
):
    """メンターエージェントとチャットする。"""
    user_id = user["uid"]
    session_id = f"mentor_{user_id}"

    # ADKセッションが存在するか確認、なければ作成
    session_service = get_session_service()
    adk_session = await session_service.get_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )
    if not adk_session:
        adk_session = await session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
            state={"user_id": user_id},
        )

    # ADK Runnerにメッセージを送信
    runner = get_mentor_runner()
    user_content = types.Content(role="user", parts=[types.Part(text=body.message)])

    response_text = ""
    try:
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=user_content,
        ):
            logger.debug(f"ADK event: {event}")
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        if event.is_final_response():
                            response_text = part.text
                        elif not response_text:
                            response_text = part.text
    except Exception as e:
        logger.error(f"ADK runner error: {e}", exc_info=True)
        response_text = "申し訳ございません。エラーが発生しました。もう一度お試しください。"

    if not response_text:
        logger.warning("No response text from ADK runner")
        response_text = "申し訳ございません。応答を生成できませんでした。もう一度お試しください。"

    return MentorChatResponse(
        id=f"msg_{datetime.now(timezone.utc).timestamp()}",
        role="assistant",
        message=response_text,
        created_at=datetime.now(timezone.utc),
    )


@router.post("/reset")
async def reset_mentor_session(
    user: dict = Depends(get_current_user),
):
    """メンターセッションをリセットする。"""
    user_id = user["uid"]
    session_id = f"mentor_{user_id}"

    session_service = get_session_service()
    try:
        await session_service.delete_session(
            app_name=APP_NAME, user_id=user_id, session_id=session_id
        )
    except Exception:
        pass  # セッションが存在しない場合は無視

    return {"status": "reset"}
