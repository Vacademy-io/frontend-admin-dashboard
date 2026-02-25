# Applicant List API

## Endpoint
```
POST /admin-core-service/v1/applicant/list
```

## Query Parameters
- `pageNo` (optional, default: 0)
- `pageSize` (optional, default: 10)

## Request Body
```json
{
  "institute_id": "string (optional)",
  "source": "string (optional)",
  "source_id": "string (optional)",
  "application_stage_id": "string (optional)",
  "package_session_ids": ["string"] (optional),
  "overall_statuses": ["string"] (optional),
  "search": "string (optional)"
}
```

## Response
```json
{
  "content": [
    {
      "applicant_id": "uuid",
      "tracking_id": "ABC12",
      "overall_status": "PENDING",
      "application_stage_status": "INITIATED",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "application_stage": {
        "stage_id": "uuid",
        "stage_name": "Application Review",
        "source": "LEVEL",
        "source_id": "class_5",
        "type": "FORM"
      },
      "student_data": {
        "user_id": "uuid",
        "full_name": "John Doe",
        "gender": "MALE",
        "date_of_birth": "2015-05-10",
        "father_name": "Richard Doe",
        "mother_name": "Jane Doe",
        "address_line": "123 Main St",
        "city": "Mumbai",
        "pin_code": "400001",
        "previous_school_name": "ABC School",
        "applying_for_class": "Grade 5",
        "academic_year": "2024-25"
      },
      "parent_data": {
        "user_id": "uuid",
        "full_name": "Richard Doe",
        "email": "richard@example.com",
        "mobile_number": "+911234567890",
        "address_line": "123 Main St",
        "city": "Mumbai",
        "pin_code": "400001"
      },
      "package_session": {
        "package_session_id": "uuid",
        "session_name": "2024-25",
        "level_name": "Grade 5",
        "package_name": "Premium Package",
        "group_name": "Section A",
        "start_time": "2024-04-01",
        "status": "ACTIVE"
      }
    }
  ],
  "pageable": {},
  "totalElements": 100,
  "totalPages": 10
}
```

## Example cURL
```bash
curl -X POST "http://localhost:8080/admin-core-service/v1/applicant/list?pageNo=0&pageSize=10" \
  -H "Content-Type: application/json" \
  -d '{
    "institute_id": "inst-123",
    "package_session_ids": ["ps-1", "ps-2"],
    "overall_statuses": ["PENDING", "APPROVED"],
    "search": "ABC12"
  }'
```

## Notes
- All request body fields are optional
- `package_session_ids` and `overall_statuses` support multiple values (collective filtering)
- `search` matches against tracking_id, applicant_id, and application_stage_id
- Response includes full student, parent, and package session details
