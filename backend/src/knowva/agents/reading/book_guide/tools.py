"""BookGuide SubAgent用ツール。"""

from google.adk.tools import ToolContext

from knowva.services import firestore


async def get_book_info(tool_context: ToolContext) -> dict:
    """現在読んでいる本の詳細情報を取得する。

    本のタイトル、著者、読書の文脈などを取得し、
    専門的な質問への回答の参考にする。

    Args:
        tool_context: ツール実行コンテキスト。

    Returns:
        dict: 本の詳細情報。タイトル、著者、ISBN、読書コンテキストを含む。
    """
    user_id = tool_context.session.state.get("user_id")
    reading_id = tool_context.session.state.get("reading_id")

    if not user_id or not reading_id:
        return {"status": "error", "error_message": "Session context not found"}

    reading = await firestore.get_reading(user_id, reading_id)
    if reading:
        book = reading.get("book", {})
        return {
            "status": "success",
            "book": {
                "title": book.get("title"),
                "author": book.get("author"),
                "isbn": book.get("isbn"),
            },
            "reading_context": reading.get("reading_context"),
        }
    return {"status": "error", "error_message": "Reading not found"}
