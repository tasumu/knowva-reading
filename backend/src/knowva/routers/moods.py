"""心境記録のAPIルーター"""

from fastapi import APIRouter, Depends, HTTPException

from knowva.middleware.firebase_auth import get_current_user
from knowva.models.mood import (
    MoodComparisonResponse,
    MoodCreate,
    MoodResponse,
)
from knowva.services import firestore

router = APIRouter()


@router.post("/{reading_id}/moods", response_model=MoodResponse)
async def save_mood(
    reading_id: str,
    body: MoodCreate,
    user: dict = Depends(get_current_user),
):
    """心境記録を保存する（before/after）。同じtypeは上書き。"""
    # 読書記録の存在確認
    reading = await firestore.get_reading(user["uid"], reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")

    data = {
        "mood_type": body.mood_type,
        "metrics": body.metrics.model_dump(),
        "note": body.note,
        "dominant_emotion": body.dominant_emotion,
    }
    result = await firestore.save_mood(user["uid"], reading_id, data)
    return result


@router.get("/{reading_id}/moods", response_model=list[MoodResponse])
async def list_moods(
    reading_id: str,
    user: dict = Depends(get_current_user),
):
    """読書記録に紐づく心境記録一覧を取得する。"""
    reading = await firestore.get_reading(user["uid"], reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")

    return await firestore.list_moods(user["uid"], reading_id)


# NOTE: comparison は {mood_type} より前に定義する必要がある
@router.get("/{reading_id}/moods/comparison", response_model=MoodComparisonResponse)
async def get_mood_comparison(
    reading_id: str,
    user: dict = Depends(get_current_user),
):
    """読書前後の心境比較データを取得する。"""
    reading = await firestore.get_reading(user["uid"], reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")

    return await firestore.get_mood_comparison(user["uid"], reading_id)


@router.get("/{reading_id}/moods/{mood_type}", response_model=MoodResponse)
async def get_mood(
    reading_id: str,
    mood_type: str,
    user: dict = Depends(get_current_user),
):
    """特定の心境記録を取得する（before/after）。"""
    if mood_type not in ("before", "after"):
        raise HTTPException(status_code=400, detail="mood_type must be 'before' or 'after'")

    reading = await firestore.get_reading(user["uid"], reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Reading not found")

    result = await firestore.get_mood(user["uid"], reading_id, mood_type)
    if not result:
        raise HTTPException(status_code=404, detail="Mood record not found")

    return result

    return await firestore.get_mood_comparison(user["uid"], reading_id)
