import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Float, Text, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()

class Document(Base):
    __tablename__ = 'documents'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(Text, nullable=True)
    source_text = Column(Text, nullable=False)
    source_format = Column(Text, nullable=False, default='plain')
    language = Column(Text, default='en')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    sections = relationship("DocumentSection", back_populates="document", cascade="all, delete-orphan")
    rewrite_jobs = relationship("RewriteJob", back_populates="document", cascade="all, delete-orphan")


class DocumentSection(Base):
    __tablename__ = 'document_sections'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    section_index = Column(Integer, nullable=False)
    heading = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    content_type = Column(Text, nullable=False, default='paragraph')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    document = relationship("Document", back_populates="sections")
    rewrites = relationship("SectionRewrite", back_populates="section", cascade="all, delete-orphan")


class RewriteJob(Base):
    __tablename__ = 'rewrite_jobs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    status = Column(Text, nullable=False)
    tone = Column(Text, nullable=False)
    strength = Column(Text, nullable=False)
    preserve_numbers = Column(Boolean, nullable=False, default=True)
    preserve_entities = Column(Boolean, nullable=False, default=True)
    preserve_links = Column(Boolean, nullable=False, default=True)
    return_alternatives = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    document = relationship("Document", back_populates="rewrite_jobs")
    section_rewrites = relationship("SectionRewrite", back_populates="job", cascade="all, delete-orphan")


class SectionRewrite(Base):
    __tablename__ = 'section_rewrites'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rewrite_job_id = Column(UUID(as_uuid=True), ForeignKey('rewrite_jobs.id', ondelete='CASCADE'), nullable=False)
    section_id = Column(UUID(as_uuid=True), ForeignKey('document_sections.id', ondelete='CASCADE'), nullable=False)
    chosen_candidate_id = Column(UUID(as_uuid=True), nullable=True)
    diagnostics = Column(JSONB, nullable=True)
    plan = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    job = relationship("RewriteJob", back_populates="section_rewrites")
    section = relationship("DocumentSection", back_populates="rewrites")
    candidates = relationship("RewriteCandidate", back_populates="section_rewrite", cascade="all, delete-orphan")


class RewriteCandidate(Base):
    __tablename__ = 'rewrite_candidates'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_rewrite_id = Column(UUID(as_uuid=True), ForeignKey('section_rewrites.id', ondelete='CASCADE'), nullable=False)
    candidate_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    semantic_score = Column(Float, nullable=True)
    preservation_score = Column(Float, nullable=True)
    naturalness_score = Column(Float, nullable=True)
    repetition_score = Column(Float, nullable=True)
    readability_score = Column(Float, nullable=True)
    grammar_score = Column(Float, nullable=True)
    final_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    section_rewrite = relationship("SectionRewrite", back_populates="candidates")


class UserFeedback(Base):
    __tablename__ = 'user_feedback'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rewrite_job_id = Column(UUID(as_uuid=True), ForeignKey('rewrite_jobs.id', ondelete='CASCADE'), nullable=False)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('rewrite_candidates.id', ondelete='SET NULL'), nullable=True)
    rating = Column(Integer, nullable=True)
    selected = Column(Boolean, default=False)
    reason_code = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    rewrite_job = relationship("RewriteJob")
    candidate = relationship("RewriteCandidate")
