from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .database import get_db
from .models import DiseaseReport, InstitutionLocation
from pydantic import BaseModel
from typing import List

router = APIRouter()

class DiseaseReportItem(BaseModel):
    disease_name: str
    institution_code: str

class InstitutionLocationSchema(BaseModel):
    institution_code: str
    latitude: float
    longitude: float
    state_name: str

@router.post("/report")
async def add_disease_report(report: DiseaseReportItem, db: AsyncSession = Depends(get_db)):
    # Check if report already exists for this institution
    result = await db.execute(select(DiseaseReport).where(
        DiseaseReport.disease_name == report.disease_name,
        DiseaseReport.institution_code == report.institution_code
    ))
    existing_report = result.scalars().first()
    
    if existing_report:
        existing_report.frequency += 1
    else:
        new_report = DiseaseReport(disease_name=report.disease_name, institution_code=report.institution_code, frequency=1)
        db.add(new_report)
        
    await db.commit()
    return {"status": "Report updated"}

@router.get("/all")
async def get_all_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DiseaseReport))
    return result.scalars().all()

@router.post("/location")
async def add_institution_location(location: InstitutionLocationSchema, db: AsyncSession = Depends(get_db)):
    new_loc = InstitutionLocation(**location.dict())
    db.add(new_loc)
    await db.commit()
    return {"status": "Location added"}

@router.get("/locations")
async def get_all_locations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InstitutionLocation))
    return result.scalars().all()
