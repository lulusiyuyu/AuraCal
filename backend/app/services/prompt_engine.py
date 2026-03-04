"""
Prompt Engine — time-aware context assembly for AI breathing.

Builds emotionally-colored prompts based on current time of day,
persona character, user's custom context, and language preference.
"""

from datetime import datetime


TIME_CONTEXTS = {
    "en": {
        "dawn": "It's early morning. A new day has just begun — the user might be preparing to start work or study.",
        "morning": "It's morning. Peak focus time — the most productive part of the day.",
        "noon": "It's around noon. The user might be taking a lunch break, feeling a bit lazy.",
        "afternoon": "It's afternoon. Might be feeling tired — needs a boost of encouragement.",
        "evening": "It's evening. Golden time for deep thinking, coding, or reading.",
        "night": "It's late night / early hours. Everything is quiet, and the user is still pushing through.",
    },
    "zh": {
        "dawn": "现在是清晨。新的一天刚刚开始，用户可能正在准备开启学习或工作。",
        "morning": "现在是上午。正是精力最集中、最高效的时候。",
        "noon": "现在是中午。用户可能在午休或吃饭，处于稍微慵懒的状态。",
        "afternoon": "现在是下午。可能会有些疲惫，需要提神和鼓励。",
        "evening": "现在是夜晚。正是沉下心来深度思考、写代码或看书的黄金时间。",
        "night": "现在是深夜/凌晨。万籁俱寂，用户依然在熬夜奋战。",
    },
}

PROMPT_TEMPLATES = {
    "en": {
        "env_header": "【Current Environment】",
        "time_label": "Current time:",
        "memo_label": "User's custom memo/goals:",
        "memo_none": "None",
        "task_header": "【Task】",
        "task_body": (
            "Based on your character and the current time context, generate:\n"
            "1. 10-15 danmaku messages of varying length (in your persona's voice — encouragement, quips, or in-character monologue).\n"
            "2. 20-30 keywords, short phrases, or emojis related to the current context or goals (for background word cloud)."
        ),
        "format_header": "【Output Format】",
        "format_body": (
            "You MUST return strict pure JSON. "
            "Do NOT include any Markdown code block markers (like ```json), do NOT include <think> or any reasoning text!\n"
            "JSON structure MUST be exactly:\n"
        ),
        "user_msg": "Please generate danmaku and word cloud data. Return strict pure JSON object.",
    },
    "zh": {
        "env_header": "【当前环境上下文】",
        "time_label": "当前精确时间：",
        "memo_label": "用户自定义备忘录/目标：",
        "memo_none": "无",
        "task_header": "【任务】",
        "task_body": (
            "结合你的角色设定和当前的时间上下文，生成：\n"
            "1. 10-15句长短不一的弹幕（融入你的语气，可以是鼓励、吐槽或符合人设的自言自语）。\n"
            "2. 20-30个与当前上下文或目标相关的关键词、短语或Emoji（用于展示在背景的词云中）。"
        ),
        "format_header": "【输出格式】",
        "format_body": (
            "必须返回严格的纯 JSON 格式数据。"
            "不要包含任何 Markdown 代码块标记（如 ```json），不要包含 <think> 等思考过程文字！\n"
            "JSON 结构必须严格如下：\n"
        ),
        "user_msg": "请生成弹幕和词云数据，严格返回纯 JSON 对象。",
    },
}


def get_time_context(language: str = "en") -> str:
    """Generate an emotionally-colored time context string."""
    hour = datetime.now().hour
    lang = TIME_CONTEXTS.get(language, TIME_CONTEXTS["en"])

    if 5 <= hour < 9:
        return lang["dawn"]
    elif 9 <= hour < 12:
        return lang["morning"]
    elif 12 <= hour < 14:
        return lang["noon"]
    elif 14 <= hour < 18:
        return lang["afternoon"]
    elif 18 <= hour < 23:
        return lang["evening"]
    else:
        return lang["night"]


def build_breathing_prompt(
    persona_prompt: str,
    custom_context: str = "",
    language: str = "en",
) -> list[dict[str, str]]:
    """
    Build the full message list for AI chat completion.

    Returns OpenAI-format messages: [system, user]
    """
    now = datetime.now()
    time_context = get_time_context(language)
    t = PROMPT_TEMPLATES.get(language, PROMPT_TEMPLATES["en"])

    system_content = f"""{persona_prompt}

{t["env_header"]}
{time_context}
{t["time_label"]} {now.strftime('%H:%M')}
{t["memo_label"]} {custom_context if custom_context else t["memo_none"]}

{t["task_header"]}
{t["task_body"]}

{t["format_header"]}
{t["format_body"]}{{
  "danmaku": ["message1", "message2", ...],
  "word_cloud": ["word1", "word2", ...]
}}"""

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": t["user_msg"]},
    ]
