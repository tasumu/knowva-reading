from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

# セッションタイプ: 読書前、読書中、読書後
SessionType = Literal["before_reading", "during_reading", "after_reading"]


class SessionCreate(BaseModel):
    session_type: SessionType


class SessionResponse(BaseModel):
    id: str
    reading_id: str
    session_type: SessionType
    started_at: datetime
    ended_at: Optional[datetime] = None
    summary: Optional[str] = None
    # TODO(phase2): gcs_log_pathフィールド有効化
