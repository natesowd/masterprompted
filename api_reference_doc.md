# AI Content Analysis API Reference

## Overview

This document provides a reference for 5 content analysis APIs focused on claim detection, fact-checking, hate speech detection, and fallacy identification. All APIs accept JSON payloads and return structured responses.

**Language Support:** Currently English only

---

## 1. Claim Detection (Extraction)

Extracts individual claims and their associated text snippets from input text.

### Endpoint
```
POST https://claim-detection-aicode.ilabhub.atc.gr/extract_claims
```

### Request Format
```json
{
  "message": "<your_input_text>"
}
```

### Response Format
```json
{
  "claims": [
    {
      "claim": "Extracted claim statement",
      "snippet": "Original text snippet"
    }
  ]
}
```

### Example Request
```bash
curl --location 'https://claim-detection-aicode.ilabhub.atc.gr/extract_claims' \
--header 'Content-Type: application/json' \
--data '{
  "message": "The sun is the center of the solar system. The Earth orbits around it."
}'
```

### Example Response
```json
{
  "claims": [
    {
      "claim": "The sun is the center of our solar system.",
      "snippet": "The sun is the center of the solar system."
    },
    {
      "claim": "The Earth orbits around the sun.",
      "snippet": "The Earth orbits around it."
    }
  ]
}
```

### Additional Resources
- Swagger UI: https://claim-detection-aicode.ilabhub.atc.gr/
- **Note:** Ignore legacy endpoints and `language_code` field in documentation

---

## 2. Claim Matching

Checks if a claim has been previously debunked by searching against a database (currently populated with Elections24 data).

### Endpoint
```
POST https://claim-matching-aicode.ilabhub.atc.gr/claim_match
```

### Request Format
```json
{
  "message": "<claim_to_check>"
}
```

### Response Format
```json
{
  "debunked": "yes|no",
  "url": "URL to debunking article",
  "title": "Title of debunking article",
  "report": "Debunking report text",
  "similarity_score": 0.95
}
```

### Example Request
```bash
curl --location 'https://claim-matching-aicode.ilabhub.atc.gr/claim_match' \
--header 'Content-Type: application/json' \
--data '{
  "message": "HAARP is responsible for floods in Spain."
}'
```

### Example Response
```json
{
  "debunked": "yes",
  "url": "https://science.feedback.org/review/haarp-cant-create-floods-climate-change-can-make-heavy-rainfall-more-extreme/",
  "title": "No, HAARP can't create floods, climate change can make heavy rainfall more extreme",
  "report": "",
  "similarity_score": 0.9574411511421204
}
```

### Additional Resources
- Swagger UI: https://claim-matching-aicode.ilabhub.atc.gr/

---

## 3. Web Search & Debunking

Performs web search for a claim, collects related resources, and generates a debunking report using counter-evidence.

### Endpoint
```
POST https://web-search-aicode.ilabhub.atc.gr/web_search/
```

**Important:** The trailing slash `/` is required

### Request Format
```json
{
  "claim_text": "<claim_to_research>"
}
```

### Response Format
```json
{
  "claim": "Original claim text",
  "debunking": [
    {
      "context": "Text excerpt from debunking source",
      "metadata": {
        "source": "URL",
        "origin": "domain",
        "found_via": ["google", "tavily"],
        "embedding_similarity": 0.75,
        "citation_number": 1
      }
    }
  ],
  "supporting": [
    {
      "context": "Text excerpt from supporting source",
      "metadata": { /* same structure */ }
    }
  ],
  "related": [
    {
      "context": "Text excerpt from related source",
      "metadata": { /* same structure */ }
    }
  ],
  "claim_debunked": true,
  "debunk_report": "Generated debunking report text"
}
```

### Example Request
```bash
curl --location 'https://web-search-aicode.ilabhub.atc.gr/web_search/' \
--header 'Content-Type: application/json' \
--data '{
  "claim_text": "Ukraine will sell land to be used as a toxic waste dump"
}'
```

### Key Response Fields
- `debunking`: Sources that counter the claim
- `supporting`: Sources that support the claim
- `related`: General related sources
- `claim_debunked`: Boolean indicating if claim was debunked
- `debunk_report`: AI-generated summary of debunking evidence

### Additional Resources
- Swagger UI: https://web-search-aicode.ilabhub.atc.gr/
- **Note:** Ignore `language_code` field in documentation

---

## 4. Hate Speech Detection

Analyzes text for hate speech across multiple categories and identifies specific problematic segments.

### Endpoint
```
POST https://hate-detection-aicode.ilabhub.atc.gr/hate_speech_two_step
```

### Request Format
```json
{
  "message": "<text_to_analyze>"
}
```

### Response Format
```json
{
  "responses": [
    {
      "category": "Racism|Sexism|Religious|Sexual Orientation|No Hate",
      "highlighted_text": "Specific text segment identified"
    }
  ]
}
```

### Categories
- **No Hate**: No hate speech detected
- **Racism**: Racist content
- **Sexism**: Sexist content
- **Religious**: Religious hate speech
- **Sexual Orientation**: Hate speech based on sexual orientation

### Example Request
```bash
curl --location 'https://hate-detection-aicode.ilabhub.atc.gr/hate_speech_two_step' \
--header 'Content-Type: application/json' \
--data '{
  "message": "Immigrants are somehow inferior to whites."
}'
```

### Example Response
```json
{
  "responses": [
    {
      "category": "Racism",
      "highlighted_text": "Immigrants are somehow inferior to whites"
    }
  ]
}
```

### Additional Resources
- Swagger UI: https://hate-detection-aicode.ilabhub.atc.gr/docs

---

## 5. Fallacy Detection (Disinformation Signals)

Examines text for logical fallacies with confidence scores and text span identification.

### Endpoint
```
POST https://fd-vc.ilabhub.atc.gr/api/v1/disinformation_signals
```

### Request Format
```json
{
  "text": "<text_to_analyze>",
  "use_groq": true,
  "double_stage": false
}
```

**Required Parameters:**
- `use_groq`: Keep as `true`
- `double_stage`: Keep as `false`

### Response Format
```json
{
  "signals": [
    {
      "name": "FALLACY",
      "spans": [
        {
          "start": 910,
          "end": 928,
          "segment": "Text segment",
          "confidence": 80.0,
          "value": "fallacy_type"
        }
      ]
    }
  ],
  "fallacies": [
    {
      "fallacy_type": "hasty generalization",
      "fallacious_text": "Text containing fallacy",
      "confidence_score": 80.0
    }
  ],
  "allowed_fallacies": [
    "hasty generalization",
    "false dilemma",
    "ad populum",
    "circular reasoning",
    "false causality",
    "ad hominem",
    "slippery slope"
  ],
  "metadata": {
    "total_fallacies": 2,
    "model_info": {
      "provider": "Groq",
      "model_name": "llama-3.3-70b-versatile",
      "double_stage": false
    }
  }
}
```

### Detected Fallacy Types
1. **Hasty Generalization**: Drawing conclusions from insufficient evidence
2. **False Dilemma**: Presenting only two options when more exist
3. **Ad Populum**: Appeal to popularity
4. **Circular Reasoning**: Conclusion restates premise
5. **False Causality**: Incorrectly assuming causation
6. **Ad Hominem**: Attacking the person instead of argument
7. **Slippery Slope**: Assuming one action leads to extreme consequences

### Example Request
```bash
curl --location 'https://fd-vc.ilabhub.atc.gr/api/v1/disinformation_signals' \
--header 'Content-Type: application/json' \
--data '{
  "text": "Your input text here...",
  "use_groq": true,
  "double_stage": false
}'
```

### Additional Resources
- Swagger UI: https://fd-vc.ilabhub.atc.gr/docs
- **Note:** Only use `/api/v1/disinformation_signals` endpoint; ignore others

---

## Common Headers

All endpoints require:
```
Content-Type: application/json
```

## Error Handling

All APIs return standard HTTP status codes:
- `200`: Success
- `4xx`: Client errors (malformed request, invalid parameters)
- `5xx`: Server errors

---

## Integration Notes

1. **Authentication**: No API keys or authentication required for current endpoints
2. **Rate Limiting**: Check with API provider for current rate limits
3. **Language**: All APIs currently support English only
4. **Response Times**: Vary by endpoint complexity (Web Search typically takes longest)
5. **Character Spans**: Fallacy detection returns character positions for precise text highlighting
