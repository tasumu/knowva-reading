"""複数のエージェントで共有されるツール関数。"""

from google.adk.tools import ToolContext

from knowva.services import firestore


async def save_profile_entry(
    content: str,
    entry_type: str,
    note: str,
    tool_context: ToolContext,
) -> dict:
    """ユーザーのプロファイル情報をFirestoreに保存する。

    対話の中でユーザーの目標、興味、読みたい本などが出てきた際に呼び出す。
    小さな情報でも積極的に保存すること。

    Args:
        content: プロファイル情報の内容。ユーザーの言葉をなるべくそのまま使う。
        entry_type: 情報の種類。"goal"(目標), "interest"(興味),
                    "book_wish"(読みたい本), "other"(その他) のいずれか。
        note: この情報についてのメモや補足（AIが付加する説明など）。
        tool_context: ツール実行コンテキスト。

    Returns:
        dict: 保存結果。statusとentry_idを含む。
    """
    user_id = tool_context.session.state.get("user_id")

    if not user_id:
        return {"status": "error", "error_message": "User context not found"}

    result = await firestore.save_profile_entry(
        user_id=user_id,
        data={
            "entry_type": entry_type,
            "content": content,
            "note": note if note else None,
        },
    )
    return {"status": "success", "entry_id": result["id"]}


async def get_current_entries(tool_context: ToolContext) -> dict:
    """現在登録されているプロファイルエントリを取得する。

    対話の最初に呼び出して、既存の情報を把握するために使う。

    Args:
        tool_context: ツール実行コンテキスト。

    Returns:
        dict: プロファイルエントリのリスト。タイプごとにグルーピング。
    """
    user_id = tool_context.session.state.get("user_id")

    if not user_id:
        return {"status": "error", "error_message": "User context not found"}

    entries = await firestore.list_profile_entries(user_id)

    # タイプごとにグルーピング
    grouped = {
        "goals": [e for e in entries if e.get("entry_type") == "goal"],
        "interests": [e for e in entries if e.get("entry_type") == "interest"],
        "book_wishes": [e for e in entries if e.get("entry_type") == "book_wish"],
        "others": [e for e in entries if e.get("entry_type") == "other"],
    }

    return {"status": "success", "entries": grouped, "total_count": len(entries)}
