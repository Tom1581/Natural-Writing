from fastapi import APIRouter
from app.schemas.compare import CompareRequest, CompareResponse

router = APIRouter()

@router.post("/v1/compare", response_model=CompareResponse)
async def compare_documents(request: CompareRequest):
    \"\"\"
    Returns a structured comparison between original and rewritten text.
    \"\"\"
    # TODO: Implement diffing and analysis logic using utils/diffing.py
    
    # Returning mock data based on the API schema design for now
    return CompareResponse(
        entity_changes=[],
        number_changes=[],
        risk_flags=[],
        phrase_changes=[
            {
                "from": "It is important to note that",
                "to": ""
            }
        ],
        similarity=0.96
    )
