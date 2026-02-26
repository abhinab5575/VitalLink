from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .auth_router import router as auth_router
from .patients_router import router as patients_router
from .diseases_router import router as diseases_router
import asyncio

app = FastAPI(title="VitalLink API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(patients_router, prefix="/patients", tags=["patients"])
app.include_router(diseases_router, prefix="/diseases", tags=["diseases"])

@app.on_event("startup")
async def startup():
    # Attempt to create tables on startup (only for dev, use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"message": "Welcome to the VitalLink API"}
