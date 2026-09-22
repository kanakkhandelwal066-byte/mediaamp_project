from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.auth_service import AuthService
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=ResponseEnvelope[TokenResponse], status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account and obtain access token."""
    service = AuthService(db)
    token_resp = service.register(payload)
    return ResponseEnvelope(
        success=True,
        message="Account created successfully",
        data=token_resp
    )

@router.post("/login", response_model=ResponseEnvelope[TokenResponse])
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password to receive JWT bearer token."""
    service = AuthService(db)
    token_resp = service.login(payload)
    return ResponseEnvelope(
        success=True,
        message="Login successful",
        data=token_resp
    )

@router.get("/me", response_model=ResponseEnvelope[UserOut])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return ResponseEnvelope(
        success=True,
        message="Profile fetched successfully",
        data=UserOut(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.full_name,
            phone=current_user.phone,
            role=current_user.role.name if current_user.role else "USER",
            avatar_url=current_user.avatar_url,
            created_at=current_user.created_at
        )
    )
