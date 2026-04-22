import json
import sys
from collections import Counter
from pathlib import Path

import joblib


def resolve_model_path(models_dir: Path, model_type: str) -> Path:
    aliases = {
        "rf": "randomforest.pkl",
        "randomforest": "randomforest.pkl",
        "et": "extratrees.pkl",
        "extratrees": "extratrees.pkl",
        "xg": "xgboost.pkl",
        "xgb": "xgboost.pkl",
        "xgboost": "xgboost.pkl",
    }
    filename = aliases.get(model_type.lower(), "xgboost.pkl")
    return models_dir / filename


def load_model(model_path: Path):
    return joblib.load(model_path)


def get_expected_feature_count(model):
    if hasattr(model, "n_features_in_"):
        return int(model.n_features_in_)

    if hasattr(model, "get_booster"):
        return int(model.get_booster().num_features())

    return None


def normalize_features(features, expected_count):
    if expected_count is None:
        return features

    if len(features) > expected_count:
        return features[:expected_count]

    if len(features) < expected_count:
        return features + [0] * (expected_count - len(features))

    return features


def run_single_model(model, model_type, features):
    normalized_features = normalize_features(features, get_expected_feature_count(model))
    prediction = model.predict([normalized_features])[0]
    confidence = None

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba([normalized_features])[0]
        confidence = max(float(value) for value in probabilities)

    return {
        "prediction": str(prediction),
        "confidence": confidence,
        "modelType": model_type,
    }


def run_ensemble(models_dir: Path, features):
    member_order = ["rf", "et", "xgb"]
    member_results = []

    for member_type in member_order:
        model = load_model(resolve_model_path(models_dir, member_type))
        member_results.append(run_single_model(model, member_type, features))

    vote_counter = Counter(result["prediction"] for result in member_results)
    majority_prediction, _ = vote_counter.most_common(1)[0]
    supporting_results = [result for result in member_results if result["prediction"] == majority_prediction]
    confidences = [result["confidence"] for result in supporting_results if result["confidence"] is not None]
    confidence = sum(confidences) / len(confidences) if confidences else None

    return {
        "prediction": majority_prediction,
        "confidence": confidence,
        "modelType": "ensemble",
        "votes": dict(vote_counter),
        "individualModels": member_results,
    }


def main():
    payload = json.loads(sys.stdin.read() or "{}")
    models_dir = Path(payload["modelsDir"])
    model_type = payload.get("modelType", "rf")
    features = payload.get("features", [])

    normalized_model_type = str(model_type).lower()

    if normalized_model_type == "ensemble":
        result = run_ensemble(models_dir, features)
    else:
        model_path = resolve_model_path(models_dir, normalized_model_type)
        model = load_model(model_path)
        result = run_single_model(model, normalized_model_type, features)

    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.stderr.write(str(exc))
        sys.exit(1)
