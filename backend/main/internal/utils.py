def fix_base64_padding(base64_str: str) -> str:
    missing_padding = len(base64_str) % 4
    if missing_padding:
        base64_str += "=" * (4 - missing_padding)
    return base64_str


def fix_json_keys(json_data: dict) -> dict:
    return {int(k): v for k, v in json_data.items()}
