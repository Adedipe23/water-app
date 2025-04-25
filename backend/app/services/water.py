from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Tuple
from uuid import UUID

from sqlmodel import Session, select, func

from app.models.water_log import WaterLog
from app.models.goal import Goal
from app.models.streak import Streak
from app.schemas.water import WaterLogCreate, DateRange, WaterStats


class WaterService:
    """Service for water log operations."""
    
    @staticmethod
    def create_log(db: Session, user_id: UUID, log_in: WaterLogCreate) -> WaterLog:
        """Create a new water log."""
        # Create water log
        water_log = WaterLog(
            user_id=user_id,
            amount=log_in.amount or 1,
            notes=log_in.notes,
            timestamp=log_in.timestamp or datetime.utcnow(),
        )
        db.add(water_log)
        db.commit()
        db.refresh(water_log)
        
        # Update streak
        WaterService.update_streak(db, user_id)
        
        return water_log
    
    @staticmethod
    def get_logs_for_day(db: Session, user_id: UUID, day: date = None) -> List[WaterLog]:
        """Get water logs for a specific day."""
        if day is None:
            day = date.today()
        
        # Get start and end of day
        start_of_day = datetime.combine(day, datetime.min.time())
        end_of_day = datetime.combine(day, datetime.max.time())
        
        # Query logs
        logs = db.exec(
            select(WaterLog)
            .where(WaterLog.user_id == user_id)
            .where(WaterLog.timestamp >= start_of_day)
            .where(WaterLog.timestamp <= end_of_day)
            .order_by(WaterLog.timestamp)
        ).all()
        
        return logs
    
    @staticmethod
    def get_logs_for_range(db: Session, user_id: UUID, date_range: DateRange) -> Dict[date, List[WaterLog]]:
        """Get water logs for a date range."""
        # Get start and end of range
        start_of_range = datetime.combine(date_range.start_date, datetime.min.time())
        end_of_range = datetime.combine(date_range.end_date, datetime.max.time())
        
        # Query logs
        logs = db.exec(
            select(WaterLog)
            .where(WaterLog.user_id == user_id)
            .where(WaterLog.timestamp >= start_of_range)
            .where(WaterLog.timestamp <= end_of_range)
            .order_by(WaterLog.timestamp)
        ).all()
        
        # Group logs by date
        logs_by_date = {}
        for log in logs:
            log_date = log.timestamp.date()
            if log_date not in logs_by_date:
                logs_by_date[log_date] = []
            logs_by_date[log_date].append(log)
        
        return logs_by_date
    
    @staticmethod
    def get_stats(db: Session, user_id: UUID, period: str) -> WaterStats:
        """Get water stats for a period."""
        today = date.today()
        
        if period == "weekly":
            # Get start and end of week
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
            
            # Get logs for week
            date_range = DateRange(start_date=start_date, end_date=end_date)
            logs_by_date = WaterService.get_logs_for_range(db, user_id, date_range)
            
            # Calculate stats
            data = []
            for i in range(7):
                current_date = start_date + timedelta(days=i)
                logs = logs_by_date.get(current_date, [])
                total_amount = sum(log.amount for log in logs)
                data.append({
                    "date": current_date.isoformat(),
                    "amount": total_amount,
                })
            
            return WaterStats(period="weekly", data=data)
        
        elif period == "monthly":
            # Get start and end of month
            start_date = date(today.year, today.month, 1)
            if today.month == 12:
                end_date = date(today.year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(today.year, today.month + 1, 1) - timedelta(days=1)
            
            # Get logs for month
            date_range = DateRange(start_date=start_date, end_date=end_date)
            logs_by_date = WaterService.get_logs_for_range(db, user_id, date_range)
            
            # Calculate stats
            data = []
            current_date = start_date
            while current_date <= end_date:
                logs = logs_by_date.get(current_date, [])
                total_amount = sum(log.amount for log in logs)
                data.append({
                    "date": current_date.isoformat(),
                    "amount": total_amount,
                })
                current_date += timedelta(days=1)
            
            return WaterStats(period="monthly", data=data)
        
        else:
            raise ValueError(f"Invalid period: {period}")
    
    @staticmethod
    def get_goal(db: Session, user_id: UUID) -> Goal:
        """Get a user's water goal."""
        goal = db.exec(select(Goal).where(Goal.user_id == user_id)).first()
        return goal
    
    @staticmethod
    def update_goal(db: Session, user_id: UUID, goal_amount: int) -> Goal:
        """Update a user's water goal."""
        goal = WaterService.get_goal(db, user_id)
        
        if goal:
            # Update existing goal
            goal.goal_amount = goal_amount
            goal.updated_at = datetime.utcnow()
        else:
            # Create new goal
            goal = Goal(
                user_id=user_id,
                goal_amount=goal_amount,
            )
        
        db.add(goal)
        db.commit()
        db.refresh(goal)
        
        return goal
    
    @staticmethod
    def get_streak(db: Session, user_id: UUID) -> Streak:
        """Get a user's streak."""
        streak = db.exec(select(Streak).where(Streak.user_id == user_id)).first()
        return streak
    
    @staticmethod
    def update_streak(db: Session, user_id: UUID) -> Streak:
        """Update a user's streak."""
        streak = WaterService.get_streak(db, user_id)
        today = date.today()
        
        if not streak:
            # Create new streak
            streak = Streak(
                user_id=user_id,
                current_streak=1,
                longest_streak=1,
                last_logged_date=today,
            )
        else:
            # Update existing streak
            if streak.last_logged_date == today:
                # Already logged today, no change to streak
                pass
            elif streak.last_logged_date == today - timedelta(days=1):
                # Logged yesterday, increment streak
                streak.current_streak += 1
                if streak.current_streak > streak.longest_streak:
                    streak.longest_streak = streak.current_streak
                streak.last_logged_date = today
            else:
                # Missed a day, reset streak
                streak.current_streak = 1
                streak.last_logged_date = today
        
        streak.updated_at = datetime.utcnow()
        db.add(streak)
        db.commit()
        db.refresh(streak)
        
        return streak
    
    @staticmethod
    def check_goal_achieved(db: Session, user_id: UUID, day: date = None) -> Tuple[bool, int, int]:
        """Check if a user has achieved their water goal for a day."""
        if day is None:
            day = date.today()
        
        # Get goal
        goal = WaterService.get_goal(db, user_id)
        if not goal:
            return False, 0, 8  # Default goal is 8
        
        # Get logs for day
        logs = WaterService.get_logs_for_day(db, user_id, day)
        total_amount = sum(log.amount for log in logs)
        
        # Check if goal achieved
        return total_amount >= goal.goal_amount, total_amount, goal.goal_amount
