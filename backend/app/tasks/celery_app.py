"""
Celery Application

Background task queue configuration for processing saved search alerts.
"""
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "evoteli_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)

# Periodic task schedule
celery_app.conf.beat_schedule = {
    # Check instant alerts every 5 minutes
    "check-instant-alerts": {
        "task": "app.tasks.alert_tasks.check_instant_alerts",
        "schedule": crontab(minute="*/5"),
    },
    # Process daily alerts at configured times (hourly check)
    "process-daily-alerts": {
        "task": "app.tasks.alert_tasks.process_daily_alerts",
        "schedule": crontab(minute=0),  # Every hour
    },
    # Process weekly alerts on Monday at 9 AM UTC
    "process-weekly-alerts": {
        "task": "app.tasks.alert_tasks.process_weekly_alerts",
        "schedule": crontab(hour=9, minute=0, day_of_week=1),
    },
    # Process monthly alerts on 1st of month at 9 AM UTC
    "process-monthly-alerts": {
        "task": "app.tasks.alert_tasks.process_monthly_alerts",
        "schedule": crontab(hour=9, minute=0, day_of_month=1),
    },
    # Cleanup old alerts (keep last 90 days)
    "cleanup-old-alerts": {
        "task": "app.tasks.alert_tasks.cleanup_old_alerts",
        "schedule": crontab(hour=2, minute=0),  # Daily at 2 AM UTC
    },
    # Process Google Ads auto-sync audiences every hour
    "process-auto-sync-audiences": {
        "task": "app.tasks.google_ads_tasks.process_auto_sync_audiences",
        "schedule": crontab(minute=0),  # Every hour
    },
}

# Auto-discover tasks
celery_app.autodiscover_tasks(["app.tasks"])
