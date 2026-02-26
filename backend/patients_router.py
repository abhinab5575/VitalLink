from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .database import get_db
from .models import PatientStatus, PatientVitals
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter()

class PatientVitalsSchema(BaseModel):
    patient_id: str
    bpm: float
    temperature: float
    spo2: float
    rr_interval: float
    latitude: float
    longitude: float

class PatientVitalsResponse(PatientVitalsSchema):
    id: int
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

@router.get("/active", response_model=List[str])
async def get_active_patients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PatientStatus).where(PatientStatus.status_code == 1))
    patients = result.scalars().all()
    return [p.patient_id for p in patients]

@router.get("/{patient_id}/vitals", response_model=List[PatientVitalsResponse])
async def get_patient_vitals(patient_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PatientVitals).where(PatientVitals.patient_id == patient_id).order_by(PatientVitals.timestamp.desc()))
    vitals = result.scalars().all()
    return vitals

@router.post("/{patient_id}/vitals")
async def add_patient_vitals(patient_id: str, vitals: PatientVitalsSchema, db: AsyncSession = Depends(get_db)):
    # Check if patient exists in status, if not add them
    status_res = await db.execute(select(PatientStatus).where(PatientStatus.patient_id == patient_id))
    status = status_res.scalars().first()
    if not status:
        new_status = PatientStatus(patient_id=patient_id, status_code=1)
        db.add(new_status)
        
    new_vitals = PatientVitals(**vitals.dict())
    db.add(new_vitals)
    await db.commit()
    return {"status": "Vitals logged"}
