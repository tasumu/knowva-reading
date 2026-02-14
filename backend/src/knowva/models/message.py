from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class MessageCreate(BaseModel):
    message: str
    input_type: Literal["text", "voice"] = "text"


class OptionsData(BaseModel):
    prompt: str
    options: list[str]
    allow_multiple: bool = True
    allow_freeform: bool = True


class MessageResponse(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    message: str
    input_type: Literal["text", "voice"] = "text"
    created_at: datetime
    options: Optional[OptionsData] = None
