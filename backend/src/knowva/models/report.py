"""読書レポートのデータモデル。"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

# レポートの公開設定
ReportVisibility = Literal["private", "public", "anonymous"]


class ReportMetadata(BaseModel):
    """レポート生成時のメタデータ。"""

    session_count: int = Field(description="レポート生成時のセッション数")
    insight_count: int = Field(description="レポート生成時のInsight数")
    generation_model: str = Field(
        default="gemini-3-flash-preview", description="生成に使用したモデル"
    )


class ReportCreate(BaseModel):
    """レポート作成リクエスト（内部用）。"""

    summary: str = Field(description="レポート全体の要約")
    insights_summary: str = Field(description="Insightの統合要約")
    context_analysis: str = Field(description="ユーザー文脈との関連分析")
    action_plan_ids: list[str] = Field(
        default_factory=list, description="関連するアクションプランのID"
    )
    metadata: ReportMetadata


class ReportResponse(BaseModel):
    """レポートのレスポンス。"""

    id: str
    reading_id: str
    summary: str = Field(description="レポート全体の要約")
    insights_summary: str = Field(description="Insightの統合要約")
    context_analysis: str = Field(description="ユーザー文脈との関連分析")
    action_plan_ids: list[str] = Field(
        default_factory=list, description="関連するアクションプランのID"
    )
    metadata: ReportMetadata
    visibility: ReportVisibility = Field(default="private", description="公開設定")
    include_context_analysis: bool = Field(
        default=False, description="公開時に「あなたへの関連付け」を含めるか"
    )
    published_at: Optional[datetime] = Field(default=None, description="公開日時")
    created_at: datetime
    updated_at: datetime


class ReportVisibilityUpdate(BaseModel):
    """レポート公開設定の更新リクエスト。"""

    visibility: ReportVisibility
    include_context_analysis: bool = Field(
        default=False, description="公開時に「あなたへの関連付け」を含めるか"
    )


class ReportVisibilityResponse(BaseModel):
    """レポート公開設定の更新レスポンス。"""

    id: str
    visibility: ReportVisibility
    include_context_analysis: bool
    published_at: Optional[datetime] = None


class BookEmbed(BaseModel):
    """本の埋め込み情報。"""

    title: str
    author: str
    cover_url: Optional[str] = None


class PublicReportResponse(BaseModel):
    """公開レポート（タイムライン用）。"""

    id: str
    report_id: str
    user_id: str
    reading_id: str
    summary: str
    insights_summary: str
    context_analysis: Optional[str] = Field(
        default=None, description="include_context_analysisがFalseの場合はNone"
    )
    display_name: str
    book: BookEmbed
    reading_status: Optional[str] = None
    published_at: datetime
    is_own: bool = False
