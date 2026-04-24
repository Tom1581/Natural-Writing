from pydantic import BaseModel, Field
from typing import List
from app.schemas.common import Tone, Strength

class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=20)
    tone: Tone = "natural"
    strength: Strength = "medium"
    preserve_technical_terms: bool = True

class AnalyzeResponse(BaseModel):
    language: str
    stats: dict
    diagnostics: dict
    protected_spans: List[str]
    suggested_actions: List[str]
