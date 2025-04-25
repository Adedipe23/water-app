from fastapi import APIRouter

from app.api import auth, water

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(water.router, prefix="/water", tags=["water"])