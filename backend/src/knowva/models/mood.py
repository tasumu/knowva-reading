"""心境データモデル - 読書前後の心理状態を記録する"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class MoodMetrics(BaseModel):
    """心境の数値指標（各項目 1-5 スケール）"""

    energy: int = Field(ge=1, le=5, description="活力レベル (1:低 ↔ 5:高)")
    positivity: int = Field(ge=1, le=5, description="気分 (1:ネガティブ ↔ 5:ポジティブ)")
    clarity: int = Field(ge=1, le=5, description="思考の明晰さ (1:混乱 ↔ 5:クリア)")
    motivation: int = Field(ge=1, le=5, description="モチベーション (1:低 ↔ 5:高)")
    openness: int = Field(ge=1, le=5, description="開放性 (1:閉鎖的 ↔ 5:開放的)")


class MoodData(BaseModel):
    """心境データ（メトリクス + 自由記述）"""

    metrics: MoodMetrics
    note: Optional[str] = Field(default=None, max_length=500, description="心境メモ")
    dominant_emotion: Optional[str] = Field(
        default=None,
        description="支配的な感情キーワード（例: 期待, 不安, 好奇心, 疲労など）",
    )
    recorded_at: datetime = Field(default_factory=datetime.now)


class MoodRecord(BaseModel):
    """読書に紐づく心境記録"""

    id: str
    reading_id: str
    mood_type: Literal["before", "after"]
    mood: MoodData
    created_at: datetime
    updated_at: datetime


class MoodCreate(BaseModel):
    """心境記録の作成リクエスト"""

    mood_type: Literal["before", "after"]
    metrics: MoodMetrics
    note: Optional[str] = Field(default=None, max_length=500)
    dominant_emotion: Optional[str] = None


class MoodUpdate(BaseModel):
    """心境記録の更新リクエスト"""

    metrics: Optional[MoodMetrics] = None
    note: Optional[str] = Field(default=None, max_length=500)
    dominant_emotion: Optional[str] = None


class MoodResponse(BaseModel):
    """心境記録のレスポンス"""

    id: str
    reading_id: str
    mood_type: Literal["before", "after"]
    metrics: MoodMetrics
    note: Optional[str] = None
    dominant_emotion: Optional[str] = None
    recorded_at: datetime
    created_at: datetime
    updated_at: datetime


class MoodComparisonResponse(BaseModel):
    """読書前後の心境比較レスポンス"""

    reading_id: str
    before_mood: Optional[MoodResponse] = None
    after_mood: Optional[MoodResponse] = None
    # 変化量（afterが存在する場合のみ計算）
    changes: Optional[dict[str, int]] = None
