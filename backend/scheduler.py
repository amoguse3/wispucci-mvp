"""FSRS-lite spaced repetition scheduler.

Simplified version of the Free Spaced Repetition Scheduler. Schedules topic
reviews based on recall performance. Good enough for MVP; upgrade to full
FSRS-6 later if needed.
"""
from datetime import datetime, timedelta
import models

# Rating: 1=again (forgot), 2=hard, 3=good, 4=easy
MIN_EASE = 1.3


def schedule(tp: models.TopicProgress, rating: int) -> None:
    """Update a TopicProgress in place based on the recall rating."""
    tp.reps += 1
    tp.last_reviewed = datetime.utcnow()

    if rating == 1:  # forgot
        tp.lapses += 1
        tp.ease = max(MIN_EASE, tp.ease - 0.2)
        tp.interval_days = 0.5  # review again very soon
    else:
        if rating == 2:      # hard
            tp.ease = max(MIN_EASE, tp.ease - 0.15)
            factor = 1.2
        elif rating == 3:    # good
            factor = tp.ease
        else:                # easy
            tp.ease = tp.ease + 0.15
            factor = tp.ease * 1.3

        if tp.reps == 1:
            tp.interval_days = 1.0
        elif tp.reps == 2:
            tp.interval_days = 3.0
        else:
            tp.interval_days = min(tp.interval_days * factor, 365.0)

    tp.due_at = datetime.utcnow() + timedelta(days=tp.interval_days)


def rating_from_quiz(correct: int, total: int) -> int:
    """Map a quiz score to an FSRS rating."""
    if total == 0:
        return 3
    ratio = correct / total
    if ratio < 0.5:
        return 1
    if ratio < 0.75:
        return 2
    if ratio < 1.0:
        return 3
    return 4
