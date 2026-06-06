"""Idempotent database seeder: demo accounts + a sample course dataset.

Run after migrations:  python -m app.seed
"""
from .db import SessionLocal
from .config import settings
from .core.security import hash_password
from .models.db_models import User, Course, QuestionBank, Question, Exam


def _user(db, name, email, password, role):
    u = db.query(User).filter(User.email == email).first()
    if u:
        return u
    u = User(name=name, email=email.lower(), password_hash=hash_password(password), role=role)
    db.add(u); db.flush()
    return u


SAMPLE_QUESTIONS = [
    dict(type="mc", difficulty="standard", topic="NeuralNets",
         prompt="Which activation function is used only in the output layer to give probabilities that sum to 1?",
         payload={"o": ["ReLU", "Sigmoid", "Softmax", "Tanh"], "a": "Softmax"},
         explanation="Softmax normalises outputs into a probability distribution that sums to 1."),
    dict(type="mc", difficulty="standard", topic="Trees",
         prompt="A decision tree stops splitting at a:",
         payload={"o": ["root node", "leaf node", "decision node", "centroid"], "a": "leaf node"},
         explanation="A leaf is a pure subset = a final prediction."),
    dict(type="fill", difficulty="standard", topic="ML",
         prompt="A model that memorises the training data and fails on new data is said to be ______.",
         payload={"accept": ["overfitting", "overfit", "overfitted"]},
         explanation="Overfitting = too specific; the opposite is underfitting."),
    dict(type="match", difficulty="challenging", topic="Graph",
         prompt="Match each search algorithm to its description:",
         payload={"left": ["DFS", "BFS", "Dijkstra"],
                  "right": ["Level-by-level using a queue", "Depth-first using a stack",
                            "Greedy shortest-path using edge costs"],
                  "correct": {"DFS": "Depth-first using a stack",
                              "BFS": "Level-by-level using a queue",
                              "Dijkstra": "Greedy shortest-path using edge costs"}},
         explanation="DFS=stack, BFS=queue, Dijkstra=greedy shortest path."),
    dict(type="essay", difficulty="essay", topic="DL",
         prompt="Explain the difference between Machine Learning and Deep Learning.",
         payload={"model": "DL is a subset of ML using neural networks with many hidden layers; "
                           "ML often needs hand-engineered features, DL learns features from raw data.",
                  "keywords": ["subset", "neural network", "hidden layer", "features", "raw data"]}),
]


def seed():
    db = SessionLocal()
    try:
        admin = _user(db, "Admin", settings.seed_admin_email, settings.seed_admin_password, "admin")
        _user(db, "Student", settings.seed_student_email, settings.seed_student_password, "student")

        course = db.query(Course).filter(Course.name == "Artificial Intelligence").first()
        if not course:
            course = Course(name="Artificial Intelligence", term="AJ 2025 · Semester 2",
                            source="manual", status="active", owner_id=admin.id)
            db.add(course); db.flush()

            bank = QuestionBank(course_id=course.id, version=1, status="published")
            db.add(bank); db.flush()
            for q in SAMPLE_QUESTIONS:
                db.add(Question(bank_id=bank.id, **q))

            db.add(Exam(course_id=course.id, slug="full", title="AI — Full mock exam",
                        blurb="Real-format paper drawn from the bank.",
                        compose={"standard": 2, "challenging": 1, "essay": 1}, target_pct=80))

        db.commit()
        n_users = db.query(User).count()
        n_q = db.query(Question).count()
        print(f"Seed complete: {n_users} users, course 'Artificial Intelligence', {n_q} questions.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
