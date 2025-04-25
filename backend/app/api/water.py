from datetime import date, timedelta
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.goal import Goal, GoalCreate
from app.schemas.streak import Streak
from app.schemas.water import (
    DailyWaterLog, DateRange, WaterLog, WaterLogCreate, WaterStats
)
from app.services.water import WaterService

router = APIRouter()


@router.post("/log", response_model=WaterLog)
def log_water(
    log_in: WaterLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Log a water intake event for the authenticated user.

    Parameters:
    - **log_in**: Water log data with amount and optional notes
      - amount: Number of units consumed (default: 1)
      - notes: Optional notes about the water intake
      - timestamp: Optional custom timestamp (defaults to current time)

    Returns:
    - Created water log entry with ID and timestamp
    """
    return WaterService.create_log(db, current_user.id, log_in)


@router.get("/today", response_model=DailyWaterLog)
def get_today_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve all water logs for the current day.

    Returns:
    - Daily water log summary containing:
      - date: Current date
      - total_amount: Sum of all water intake for today
      - logs: List of individual water log entries
    """
    today = date.today()
    logs = WaterService.get_logs_for_day(db, current_user.id)
    total_amount = sum(log.amount for log in logs)

    return {
        "date": today,
        "total_amount": total_amount,
        "logs": logs,
    }


@router.get("/streak", response_model=Streak)
def get_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve the user's current streak information.

    Returns:
    - Streak object containing current streak, longest streak, and last logged date

    Raises:
    - 404 Not Found: If streak data doesn't exist for the user
    """
    streak = WaterService.get_streak(db, current_user.id)
    if not streak:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Streak not found",
        )

    return streak


@router.get("/goal", response_model=Goal)
def get_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve the user's current daily water intake goal.

    Returns:
    - Goal object containing the target amount of water units per day

    Raises:
    - 404 Not Found: If goal data doesn't exist for the user
    """
    goal = WaterService.get_goal(db, current_user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return goal


@router.post("/goal", response_model=Goal)
def update_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Set or update the user's daily water intake goal.

    Parameters:
    - **goal_in**: Goal data containing:
      - goal_amount: Target number of water units per day

    Returns:
    - Updated goal object with the new target amount
    """
    return WaterService.update_goal(db, current_user.id, goal_in.goal_amount)


@router.get("/history", response_model=List[DailyWaterLog])
def get_history(
    start_date: date = Query(..., description="Start date for history"),
    end_date: date = Query(..., description="End date for history"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve water logs over a specified date range.

    Parameters:
    - **start_date**: Beginning date for the history query (inclusive)
    - **end_date**: Ending date for the history query (inclusive)

    Returns:
    - List of daily water log summaries for each day in the range
      - Includes days with no logs (zero total_amount)
      - Sorted chronologically by date
    """
    date_range = DateRange(start_date=start_date, end_date=end_date)
    logs_by_date = WaterService.get_logs_for_range(db, current_user.id, date_range)

    result = []
    # Process days with logs
    for day, logs in logs_by_date.items():
        total_amount = sum(log.amount for log in logs)
        result.append({
            "date": day,
            "total_amount": total_amount,
            "logs": logs,
        })

    # Add empty days for complete date range
    current_date = start_date
    while current_date <= end_date:
        if current_date not in logs_by_date:
            result.append({
                "date": current_date,
                "total_amount": 0,
                "logs": [],
            })
        current_date = current_date + timedelta(days=1)

    # Sort by date
    result.sort(key=lambda x: x["date"])

    return result


@router.get("/stats", response_model=WaterStats)
def get_stats(
    period: str = Query(..., description="Period for stats (weekly or monthly)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve aggregated water intake statistics for visualization.

    Parameters:
    - **period**: Time period for statistics aggregation
      - 'weekly': Returns data for the current week (Sunday to Saturday)
      - 'monthly': Returns data for the current month

    Returns:
    - Water statistics object containing:
      - period: The requested period ('weekly' or 'monthly')
      - data: List of daily records with date and amount

    Raises:
    - 400 Bad Request: If period is not 'weekly' or 'monthly'
    """
    if period not in ["weekly", "monthly"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid period. Must be 'weekly' or 'monthly'",
        )

    return WaterService.get_stats(db, current_user.id, period)
