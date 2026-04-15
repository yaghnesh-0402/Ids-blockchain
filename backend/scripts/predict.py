import json
import pickle
import sys
from pathlib import Path


def resolve_model_path(models_dir: Path, model_type: str) -> Path:
    aliases = {
        "rf": "rf.pkl",
        "randomforest": "rf.pkl",
        "xg": "xgb.pkl",
        "xgb": "xgb.pkl",
        "xgboost": "xgb.pkl",
    }
    filename = aliases.get(model_type.lower(), "rf.pkl")
    return models_dir / filename


def load_model(model_path: Path):
    with model_path.open("rb") as model_file:
        return pickle.load(model_file)


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


def main():
    payload = json.loads(sys.stdin.read() or "{}")
    models_dir = Path(payload["modelsDir"])
    model_type = payload.get("modelType", "rf")
    features = payload.get("features", [])

    model_path = resolve_model_path(models_dir, model_type)
    model = load_model(model_path)
    features = normalize_features(features, get_expected_feature_count(model))

    prediction = model.predict([features])[0]
    confidence = None
    if hasattr(model, "predict_proba"):
      probabilities = model.predict_proba([features])[0]
      confidence = max(float(value) for value in probabilities)

    result = {
        "prediction": str(prediction),
        "confidence": confidence,
        "modelType": model_type.lower(),
    }
    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.stderr.write(str(exc))
        sys.exit(1)
