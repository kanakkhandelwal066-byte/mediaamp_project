from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.audit_repository import AuditRepository
from app.auth.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut
from app.utils.exceptions import CineBookException, UnauthorizedException

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.audit_repo = AuditRepository(db)

    def register(self, payload: UserRegister) -> TokenResponse:
        existing_user = self.user_repo.get_by_email(payload.email)
        if existing_user:
            raise CineBookException("An account with this email address already exists", error_code="EMAIL_ALREADY_EXISTS", status_code=409)

        if payload.phone:
            existing_phone = self.user_repo.get_by_phone(payload.phone)
            if existing_phone:
                raise CineBookException("An account with this phone number already exists", error_code="PHONE_ALREADY_EXISTS", status_code=409)

        role = self.user_repo.get_role_by_name("USER")
        if not role:
            raise CineBookException("Default user role not configured", error_code="ROLE_NOT_FOUND", status_code=500)

        hashed = get_password_hash(payload.password)
        new_user = User(
            email=payload.email,
            phone=payload.phone,
            hashed_password=hashed,
            full_name=payload.full_name,
            role_id=role.id,
            avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={payload.full_name}"
        )
        self.user_repo.create(new_user)
        self.db.commit()
        self.db.refresh(new_user)

        self.audit_repo.log(
            action="USER_REGISTERED",
            user_id=new_user.id,
            entity_type="User",
            entity_id=str(new_user.id)
        )
        self.db.commit()

        token = create_access_token({"sub": str(new_user.id), "role": role.name, "email": new_user.email})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserOut(
                id=new_user.id,
                email=new_user.email,
                full_name=new_user.full_name,
                phone=new_user.phone,
                role=role.name,
                avatar_url=new_user.avatar_url,
                created_at=new_user.created_at
            )
        )

    def login(self, payload: UserLogin) -> TokenResponse:
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise UnauthorizedException("Incorrect email or password")

        if not user.is_active:
            raise UnauthorizedException("Your account is deactivated")

        token = create_access_token({"sub": str(user.id), "role": user.role.name, "email": user.email})

        self.audit_repo.log(
            action="USER_LOGIN",
            user_id=user.id,
            entity_type="User",
            entity_id=str(user.id)
        )
        self.db.commit()

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserOut(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                phone=user.phone,
                role=user.role.name,
                avatar_url=user.avatar_url,
                created_at=user.created_at
            )
        )
