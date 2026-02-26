from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
import datetime
from .database import Base

# DB A: Auth & Institutions
class Institution(Base):
    __tablename__ = "institutions"
    
    institution_code = Column(String(50), primary_key=True, index=True)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    requires_password_change = Column(Boolean, default=False)
    
    # Relationships
    location = relationship("InstitutionLocation", back_populates="institution", uselist=False)
    reports = relationship("DiseaseReport", back_populates="institution")

# DB P: Patients
class PatientStatus(Base):
    __tablename__ = "patient_status"
    
    patient_id = Column(String(50), primary_key=True, index=True)
    status_code = Column(Integer, default=1) # 0: Archived, 1: Actively Measuring
    
    # Relationships
    vitals = relationship("PatientVitals", back_populates="patient")

class PatientVitals(Base):
    __tablename__ = "patient_vitals"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(String(50), ForeignKey("patient_status.patient_id"))
    bpm = Column(Float)
    temperature = Column(Float)
    spo2 = Column(Float)
    rr_interval = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    patient = relationship("PatientStatus", back_populates="vitals")

# DB D: Diseases
class InstitutionLocation(Base):
    __tablename__ = "institution_locations"
    
    institution_code = Column(String(50), ForeignKey("institutions.institution_code"), primary_key=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    state_name = Column(String(100), index=True)
    
    # Relationships
    institution = relationship("Institution", back_populates="location")

class DiseaseReport(Base):
    __tablename__ = "disease_reports"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    disease_name = Column(String(255), index=True, nullable=False)
    institution_code = Column(String(50), ForeignKey("institutions.institution_code"))
    frequency = Column(Integer, default=1)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    institution = relationship("Institution", back_populates="reports")
