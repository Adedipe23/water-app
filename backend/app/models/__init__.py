from app.models.user import User, UserBase, UserCreate, UserRead
from app.models.water_log import WaterLog, WaterLogBase, WaterLogCreate, WaterLogRead
from app.models.goal import Goal, GoalBase, GoalCreate, GoalRead
from app.models.streak import Streak, StreakBase, StreakRead

# Import these models to ensure SQLModel sees them when creating tables
__all__ = [
    "User", "UserBase", "UserCreate", "UserRead",
    "WaterLog", "WaterLogBase", "WaterLogCreate", "WaterLogRead",
    "Goal", "GoalBase", "GoalCreate", "GoalRead",
    "Streak", "StreakBase", "StreakRead",
]