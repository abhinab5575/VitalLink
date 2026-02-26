import asyncio
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import engine, Base, AsyncSessionLocal
from backend.models import Institution
from backend.auth_utils import get_password_hash
from sqlalchemy.future import select

async def seed():
    # Attempt to clear existing sqlite db to recreate schema
    db_path = os.path.join(os.path.dirname(__file__), "vitallink.db")
    if os.path.exists(db_path):
        os.remove(db_path)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # Create Admin
        admin_code = "admin"
        admin_res = await db.execute(select(Institution).where(Institution.institution_code == admin_code))
        if not admin_res.scalars().first():
            salt = "bcrypt_auto"
            hashed_pw = get_password_hash("Dreeemur@Health")
            admin = Institution(institution_code=admin_code, password_hash=hashed_pw, salt=salt, email="mishravaibhav2048@gmail.com")
            db.add(admin)
            print("Admin initialized.")
            
        # Create Dummy Inst
        dummy_code = "0000"
        dummy_res = await db.execute(select(Institution).where(Institution.institution_code == dummy_code))
        if not dummy_res.scalars().first():
            salt = "bcrypt_auto"
            hashed_pw = get_password_hash("111111")
            dummy = Institution(institution_code=dummy_code, password_hash=hashed_pw, salt=salt, email="vmalternatexd@gmail.com")
            db.add(dummy)
            print("Dummy Institution initialized.")
            
        await db.commit()
        print("Database seeding verification complete.")

if __name__ == "__main__":
    asyncio.run(seed())
