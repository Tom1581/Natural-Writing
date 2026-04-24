from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from app.schemas.common import Tone, Strength, ReadingLevel

class RewriteRequest(BaseModel):
    text: str = Field(min_length=20)
    tone: Tone = "natural"
    strength: Strength = "medium"
    preserve_numbers: bool = True
    preserve_entities: bool = True
    preserve_links: bool = True
    return_alternatives: bool = False
    reading_level: ReadingLevel = "general"
    format: Literal["plain", "markdown", "html"] = "plain"

class RewriteJobResponse(BaseModel):
    job_id: str
    status: Literal["queued", "processing", "completed", "failed"]

class RewriteResultSection(BaseModel):
    section_index: int
    original: str
    rewritten: str
    metrics: dict
    alternatives: List[str]

class RewriteResult(BaseModel):
    rewritten_text: str
    sections: List[RewriteResultSection]

class RewriteJobStatusResponse(BaseModel):
    job_id: str
    status: Literal["queued", "processing", "completed", "failed"]
    result: Optional[RewriteResult] = None

class FeedbackRequest(BaseModel):
    rewrite_job_id: str
    candidate_id: str
    rating: int
    selected: bool
    reason_code: str
