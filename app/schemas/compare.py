from pydantic import BaseModel, Field
from typing import List

class CompareRequest(BaseModel):
    original: str
    rewritten: str

class PhraseChange(BaseModel):
    from_: str = Field(..., alias="from")
    to: str

class CompareResponse(BaseModel):
    entity_changes: List[str]
    number_changes: List[str]
    risk_flags: List[str]
    phrase_changes: List[PhraseChange]
    similarity: float
