import spacy

# Load English NLP model
nlp = spacy.load("en_core_web_sm")


def fix_base64_padding(base64_str: str) -> str:
    missing_padding = len(base64_str) % 4
    if missing_padding:
        base64_str += "=" * (4 - missing_padding)
    return base64_str


def fix_json_keys(json_data: dict) -> dict:
    return {int(k): v for k, v in json_data.items()}


def extract_nouns(sentence):
    doc = nlp(sentence)
    nouns = [token.text.lower() for token in doc if token.pos_ in ["NOUN", "PROPN"]]
    return nouns


def check_condition(objects, tokenIDs):
    return all(obj in tokenIDs for obj in objects)


