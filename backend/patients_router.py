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

@router.get("/metrics/all")
async def get_all_metrics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PatientVitals).order_by(PatientVitals.timestamp.desc()))
    vitals = result.scalars().all()
    # Serialize correctly avoiding lazy loading issues or un-JSONable objects
    return [
        {
            "id": v.id,
            "patient_id": v.patient_id,
            "bpm": v.bpm,
            "spo2": v.spo2,
            "temperature": v.temperature,
            "rr_interval": v.rr_interval,
            "latitude": v.latitude,
            "longitude": v.longitude,
            "timestamp": v.timestamp.isoformat() if v.timestamp else None
        }
        for v in vitals
    ]

class PatientVitalsUpdate(BaseModel):
    bpm: Optional[float] = None
    temperature: Optional[float] = None
    spo2: Optional[float] = None
    rr_interval: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.put("/vitals/{vital_id}")
async def update_vital(vital_id: int, update_data: PatientVitalsUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PatientVitals).where(PatientVitals.id == vital_id))
    vital = result.scalars().first()
    if not vital:
        raise HTTPException(status_code=404, detail="Log not found")
        
    for key, value in update_data.dict(exclude_unset=True).items():
        if value is not None:
            setattr(vital, key, value)
            
    await db.commit()
    return {"status": "success"}

@router.delete("/vitals/{vital_id}")
async def delete_vital(vital_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PatientVitals).where(PatientVitals.id == vital_id))
    vital = result.scalars().first()
    if not vital:
        raise HTTPException(status_code=404, detail="Log not found")
        
    await db.delete(vital)
    await db.commit()
    return {"status": "deleted"}
