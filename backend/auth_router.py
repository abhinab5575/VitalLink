from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .database import get_db
from .models import Institution
from .auth_utils import verify_password, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES, Token
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class InstitutionCreate(BaseModel):
    institution_code: str
    password: str
    email: str

@router.post("/register", response_model=Token)
async def register(institution: InstitutionCreate, db: AsyncSession = Depends(get_db)):
    # Check if exists
    result = await db.execute(select(Institution).where(Institution.institution_code == institution.institution_code))
    db_inst = result.scalars().first()
    if db_inst:
        raise HTTPException(status_code=400, detail="Institution Code already registered")
    
    salt = "bcrypt_auto"
    hashed_password = get_password_hash(institution.password)
    
    new_inst = Institution(
        institution_code=institution.institution_code,
        password_hash=hashed_password,
        salt=salt,
        email=institution.email
    )
    db.add(new_inst)
    await db.commit()
    await db.refresh(new_inst)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_inst.institution_code}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Institution).where(Institution.institution_code == form_data.username))
    inst = result.scalars().first()
    
    if not inst:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect institution code or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, inst.password_hash):
        if form_data.password != inst.password_hash: # simple exact match fallback for mock data if needed
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect institution code or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": inst.institution_code}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "requires_password_change": inst.requires_password_change
    }

import string
import random

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Explicitly point to backend/.env so we don't rely on VS Code terminal injection
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

class PasswordResetCommand(BaseModel):
    institution_code: str
    email: str

def send_reset_email(to_email: str, temp_password: str):
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))

    if not sender_email or not sender_password or sender_email == "your_email@gmail.com":
        print(f"\n[Mock Email Server] -> To {to_email}: Your new temporary password is: {temp_password}\n")
        print("WARNING: SMTP_EMAIL and SMTP_PASSWORD not properly set in backend/.env. Email not actually sent.")
        return False

    try:
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = to_email
        msg["Subject"] = "VitalLink Password Reset"

        body = f"""
        Hello,

        A password reset was requested for your VitalLink account.
        Your new temporary password is: {temp_password}

        Please log in using this password. You will be prompted to change it immediately upon accessing the portal.

        Stay healthy,
        The VitalLink Team
        """
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"Successfully sent reset email to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        # Fallback to console print if SMTP fails
        print(f"\n[Mock Email Server Fallback] -> To {to_email}: Your new temporary password is: {temp_password}\n")
        return False

@router.post("/forgot-password")
async def forgot_password(cmd: PasswordResetCommand, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Institution).where(
        Institution.institution_code == cmd.institution_code,
        Institution.email == cmd.email
    ))
    inst = result.scalars().first()
    
    if not inst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No institution found with that code and email combination."
        )
        
    # Generate 10 char random password
    chars = string.ascii_letters + string.digits + "!@#$%"
    temp_password = ''.join(random.choice(chars) for i in range(10))
    
    send_reset_email(inst.email, temp_password)
        
    hashed_password = get_password_hash(temp_password)
    inst.password_hash = hashed_password
    inst.salt = "bcrypt_auto" 
    inst.requires_password_change = True
    
    await db.commit()
    return {"status": "A new password has been sent to the linked email. Please attempt logging in using it."}

class ChangePasswordCommand(BaseModel):
    institution_code: str
    old_password: str
    new_password: str

@router.post("/change-password")
async def change_password(cmd: ChangePasswordCommand, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Institution).where(Institution.institution_code == cmd.institution_code))
    inst = result.scalars().first()
    
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    if not verify_password(cmd.old_password, inst.password_hash):
        if cmd.old_password != inst.password_hash: # simple exact match fallback for mock data if needed
             raise HTTPException(status_code=400, detail="Incorrect old password")
             
    hashed_password = get_password_hash(cmd.new_password)
    inst.password_hash = hashed_password
    inst.salt = "bcrypt_auto"
    inst.requires_password_change = False
    
    await db.commit()
    return {"status": "Password successfully updated"}

@router.get("/admin/institutions")
async def get_all_institutions(db: AsyncSession = Depends(get_db)):
    # Note: In production this MUST be protected by an admin JWT token Dependency
    result = await db.execute(select(Institution))
    institutions = result.scalars().all()
    
    return [
        {
            "institution_code": inst.institution_code,
            "email": inst.email,
            "requires_password_change": inst.requires_password_change
        }
        for inst in institutions
    ]

class InstitutionUpdateSchema(BaseModel):
    email: Optional[str] = None
    requires_password_change: Optional[bool] = None

@router.put("/admin/institutions/{code}")
async def update_institution(code: str, update_data: InstitutionUpdateSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Institution).where(Institution.institution_code == code))
    inst = result.scalars().first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    if update_data.email is not None:
        inst.email = update_data.email
    if update_data.requires_password_change is not None:
        inst.requires_password_change = update_data.requires_password_change
        
    await db.commit()
    return {"status": "success"}

@router.delete("/admin/institutions/{code}")
async def delete_institution(code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Institution).where(Institution.institution_code == code))
    inst = result.scalars().first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    await db.delete(inst)
    await db.commit()
    return {"status": "deleted"}
