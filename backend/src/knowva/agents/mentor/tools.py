"""Mentor Agent用のツール関数。"""

from datetime import datetime, timedelta, timezone

from google.adk.tools import ToolContext

from knowva.services import firestore


async def get_mentor_context(
    period_days: int,
    tool_context: ToolContext,
) -> dict:
    """振り返り用のコンテキストを取得する。

    指定期間内の読書履歴、Insight、プロファイル情報を取得する。

    Args:
        period_days: 何日前までのデータを取得するか（7=1週間、30=1カ月）
        tool_context: ツール実行コンテキスト

    Returns:
        dict: 読書履歴、Insight、プロファイルを含むコンテキスト
    """
    user_id = tool_context.session.state.get("user_id")

    if not user_id:
        return {"status": "error", "error_message": "User context not found"}

    context = await firestore.get_mentor_context(
        user_id=user_id,
        period_days=period_days,
    )
    return {"status": "success", "context": context}


async def save_mentor_feedback(
    feedback_type: str,
    content: str,
    tool_context: ToolContext,
) -> dict:
    """メンターからの振り返りコメントをFirestoreに保存する。

    Args:
        feedback_type: フィードバックの種類（"weekly" または "monthly"）
        content: 振り返りコメント（称賛 + アドバイス）
        tool_context: ツール実行コンテキスト

    Returns:
        dict: 保存結果
    """
    user_id = tool_context.session.state.get("user_id")

    if not user_id:
        return {"status": "error", "error_message": "User context not found"}

    # 期間の計算
    now = datetime.now(timezone.utc)
    if feedback_type == "weekly":
        period_start = now - timedelta(days=7)
    else:
        period_start = now - timedelta(days=30)

    result = await firestore.save_mentor_feedback(
        user_id=user_id,
        data={
            "feedback_type": feedback_type,
            "content": content,
            "period_start": period_start,
            "period_end": now,
        },
    )
    return {"status": "success", "feedback_id": result["id"]}
