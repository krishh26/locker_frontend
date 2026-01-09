# Survey Module - Backend API Documentation

## Overview
This document outlines the complete API specification for the Survey module. The frontend currently uses Redux with localStorage persistence, but needs to be migrated to use backend APIs for production use.

## Data Models

### Survey Model
```typescript
interface Survey {
  id: string;                    // UUID or auto-increment ID
  name: string;                   // Required, min 2 characters
  description?: string;           // Optional
  status: 'Draft' | 'Published' | 'Archived';
  background?: {
    type: 'gradient' | 'image';
    value: string;                // CSS gradient string or image URL
  };
  userId?: string;                // Creator user ID (for user-specific surveys)
  organizationId?: string;        // Organization ID (for org-wide surveys)
  createdAt: string;              // ISO 8601 timestamp
  updatedAt: string;              // ISO 8601 timestamp
}
```

### Question Model
```typescript
interface Question {
  id: string;                     // UUID or auto-increment ID
  surveyId: string;               // Foreign key to Survey
  title: string;                  // Required
  description?: string;           // Optional
  type: 'short-text' | 'long-text' | 'multiple-choice' | 'checkbox' | 'rating' | 'date';
  required: boolean;
  options?: string[];             // Required for multiple-choice and checkbox types
  order: number;                  // For drag-and-drop ordering
  createdAt?: string;
  updatedAt?: string;
}
```

### Response Model
```typescript
interface Response {
  id: string;                     // UUID or auto-increment ID
  surveyId: string;               // Foreign key to Survey
  userId?: string;                // Respondent user ID (if authenticated)
  email?: string;                 // Respondent email (if provided)
  answers: Record<string, string | string[] | null>;  // questionId → answer value
  submittedAt: string;           // ISO 8601 timestamp
}
```

## API Endpoints

### 1. Survey Management

#### 1.1 Get All Surveys
**GET** `/api/surveys`

**Query Parameters:**
- `status` (optional): Filter by status ('Draft', 'Published', 'Archived')
- `userId` (optional): Filter by creator user ID
- `organizationId` (optional): Filter by organization ID
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or description

**Response:**
```json
{
  "success": true,
  "data": {
    "surveys": [
      {
        "id": "survey-123",
        "name": "Customer Satisfaction Survey",
        "description": "Annual customer feedback",
        "status": "Published",
        "background": {
          "type": "gradient",
          "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        "userId": "user-456",
        "organizationId": "org-789",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-20T14:22:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### 1.2 Get Survey by ID
**GET** `/api/surveys/:surveyId`

**Response:**
```json
{
  "success": true,
  "data": {
    "survey": {
      "id": "survey-123",
      "name": "Customer Satisfaction Survey",
      "description": "Annual customer feedback",
      "status": "Published",
      "background": {
        "type": "gradient",
        "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      "userId": "user-456",
      "organizationId": "org-789",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z"
    }
  }
}
```

#### 1.3 Create Survey
**POST** `/api/surveys`

**Request Body:**
```json
{
  "name": "Customer Satisfaction Survey",
  "description": "Annual customer feedback",
  "status": "Draft",
  "background": {
    "type": "gradient",
    "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "organizationId": "org-789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "survey": {
      "id": "survey-123",
      "name": "Customer Satisfaction Survey",
      "description": "Annual customer feedback",
      "status": "Draft",
      "background": {
        "type": "gradient",
        "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      "userId": "user-456",
      "organizationId": "org-789",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Validation Rules:**
- `name`: Required, minimum 2 characters
- `status`: Must be 'Draft' or 'Published'
- `background`: Optional, if provided must have `type` ('gradient' or 'image') and `value`

#### 1.4 Update Survey
**PUT** `/api/surveys/:surveyId`

**Request Body:**
```json
{
  "name": "Updated Survey Name",
  "description": "Updated description",
  "status": "Published",
  "background": {
    "type": "image",
    "value": "https://example.com/background.jpg"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "survey": {
      "id": "survey-123",
      "name": "Updated Survey Name",
      "description": "Updated description",
      "status": "Published",
      "background": {
        "type": "image",
        "value": "https://example.com/background.jpg"
      },
      "userId": "user-456",
      "organizationId": "org-789",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z"
    }
  }
}
```

**Authorization:** User must be the creator or have organization admin rights

#### 1.5 Delete Survey
**DELETE** `/api/surveys/:surveyId`

**Response:**
```json
{
  "success": true,
  "message": "Survey deleted successfully"
}
```

**Authorization:** User must be the creator or have organization admin rights

**Note:** Should also delete all associated questions and responses (or mark as archived)

#### 1.6 Apply Template to Survey
**POST** `/api/surveys/:surveyId/apply-template`

**Description:** Applies a template to a survey by updating the survey's background design and creating multiple questions in a single API call. This is useful for quickly populating a survey with pre-configured questions and styling.

**Request Body:**
```json
{
  "background": {
    "type": "gradient",
    "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "questions": [
    {
      "title": "How satisfied are you with your current role?",
      "description": "Please rate your overall satisfaction",
      "type": "rating",
      "required": true,
      "options": null,
      "order": 0
    },
    {
      "title": "What aspects of your job do you enjoy most?",
      "description": "Select all that apply",
      "type": "checkbox",
      "required": false,
      "options": [
        "Challenging projects",
        "Team collaboration",
        "Career growth opportunities",
        "Work flexibility"
      ],
      "order": 1
    },
    {
      "title": "What improvements would you suggest?",
      "description": "Please share your thoughts and suggestions",
      "type": "long-text",
      "required": false,
      "options": null,
      "order": 2
    }
  ]
}
```

**Request Body Fields:**
- `background` (optional): Object containing:
  - `type`: 'gradient' | 'image'
  - `value`: CSS gradient string or image URL
- `questions` (required): Array of question objects to create. Each question should have:
  - `title`: Required, minimum 1 character
  - `description`: Optional
  - `type`: Required, must be one of: 'short-text', 'long-text', 'multiple-choice', 'checkbox', 'rating', 'date'
  - `required`: Required, boolean
  - `options`: Required if type is 'multiple-choice' or 'checkbox', must be array with at least 1 item. Must be null or empty array for other question types.
  - `order`: Optional, auto-incremented if not provided (based on existing questions count)

**Response:**
```json
{
  "success": true,
  "data": {
    "survey": {
      "id": "survey-123",
      "name": "Employee Satisfaction Survey",
      "description": "Quarterly employee feedback",
      "status": "Draft",
      "background": {
        "type": "gradient",
        "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      "userId": "user-456",
      "organizationId": "org-789",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    },
    "questions": [
      {
        "id": "question-123",
        "surveyId": "survey-123",
        "title": "How satisfied are you with your current role?",
        "description": "Please rate your overall satisfaction",
        "type": "rating",
        "required": true,
        "options": null,
        "order": 0,
        "createdAt": "2024-01-20T15:45:00Z",
        "updatedAt": "2024-01-20T15:45:00Z"
      },
      {
        "id": "question-124",
        "surveyId": "survey-123",
        "title": "What aspects of your job do you enjoy most?",
        "description": "Select all that apply",
        "type": "checkbox",
        "required": false,
        "options": [
          "Challenging projects",
          "Team collaboration",
          "Career growth opportunities",
          "Work flexibility"
        ],
        "order": 1,
        "createdAt": "2024-01-20T15:45:00Z",
        "updatedAt": "2024-01-20T15:45:00Z"
      },
      {
        "id": "question-125",
        "surveyId": "survey-123",
        "title": "What improvements would you suggest?",
        "description": "Please share your thoughts and suggestions",
        "type": "long-text",
        "required": false,
        "options": null,
        "order": 2,
        "createdAt": "2024-01-20T15:45:00Z",
        "updatedAt": "2024-01-20T15:45:00Z"
      }
    ]
  }
}
```

**Validation Rules:**
- Survey must exist
- `background`: Optional, if provided must have `type` ('gradient' or 'image') and `value`
- `questions`: Required, must be a non-empty array
- Each question in `questions` array must follow the same validation rules as Create Question (2.2):
  - `title`: Required, minimum 1 character
  - `type`: Required, must be one of: 'short-text', 'long-text', 'multiple-choice', 'checkbox', 'rating', 'date'
  - `options`: Required if type is 'multiple-choice' or 'checkbox', must be array with at least 1 item
  - `options`: Must be null or empty array for other question types
  - `order`: If not provided, should be auto-incremented based on existing questions count (appends after existing questions)

**Authorization:** User must be the creator or have organization admin rights

**Business Logic:**
- If `background` is provided, updates the survey's background design
- Creates all questions in the `questions` array atomically (all or nothing)
- Question `order` values should be calculated to append after existing questions:
  - If survey has 3 existing questions (orders 0, 1, 2), new template questions should start at order 3
  - This ensures template questions are added after existing questions, not replacing them
- All questions are created in a single transaction to ensure data consistency
- Survey's `updatedAt` timestamp should be updated

**Error Responses:**
- If survey not found: `NOT_FOUND` error
- If validation fails: `VALIDATION_ERROR` with field-specific details
- If user lacks permission: `FORBIDDEN` error

**Note:** This endpoint is designed to be called when a user applies a template to their survey. It combines the functionality of updating survey background and creating multiple questions in a single API call for better performance and atomicity.

---

### 2. Question Management

#### 2.1 Get Questions for Survey
**GET** `/api/surveys/:surveyId/questions`

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "question-123",
        "surveyId": "survey-123",
        "title": "How satisfied are you?",
        "description": "Rate your overall satisfaction",
        "type": "rating",
        "required": true,
        "options": null,
        "order": 0,
        "createdAt": "2024-01-15T10:35:00Z",
        "updatedAt": "2024-01-15T10:35:00Z"
      },
      {
        "id": "question-124",
        "surveyId": "survey-123",
        "title": "What features do you use?",
        "description": "Select all that apply",
        "type": "checkbox",
        "required": false,
        "options": ["Feature A", "Feature B", "Feature C"],
        "order": 1,
        "createdAt": "2024-01-15T10:36:00Z",
        "updatedAt": "2024-01-15T10:36:00Z"
      }
    ]
  }
}
```

**Note:** Questions should be returned sorted by `order` field

#### 2.2 Create Question
**POST** `/api/surveys/:surveyId/questions`

**Request Body:**
```json
{
  "title": "How satisfied are you?",
  "description": "Rate your overall satisfaction",
  "type": "rating",
  "required": true,
  "options": null,
  "order": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": {
      "id": "question-123",
      "surveyId": "survey-123",
      "title": "How satisfied are you?",
      "description": "Rate your overall satisfaction",
      "type": "rating",
      "required": true,
      "options": null,
      "order": 0,
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-15T10:35:00Z"
    }
  }
}
```

**Validation Rules:**
- `title`: Required, minimum 1 character
- `type`: Must be one of: 'short-text', 'long-text', 'multiple-choice', 'checkbox', 'rating', 'date'
- `options`: Required if type is 'multiple-choice' or 'checkbox', must be array with at least 1 item
- `options`: Must be null or empty array for other question types
- `order`: Auto-incremented if not provided (based on existing questions)

#### 2.3 Update Question
**PUT** `/api/surveys/:surveyId/questions/:questionId`

**Request Body:**
```json
{
  "title": "Updated question title",
  "description": "Updated description",
  "type": "multiple-choice",
  "required": true,
  "options": ["Option 1", "Option 2", "Option 3"],
  "order": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": {
      "id": "question-123",
      "surveyId": "survey-123",
      "title": "Updated question title",
      "description": "Updated description",
      "type": "multiple-choice",
      "required": true,
      "options": ["Option 1", "Option 2", "Option 3"],
      "order": 2,
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-20T14:25:00Z"
    }
  }
}
```

#### 2.4 Delete Question
**DELETE** `/api/surveys/:surveyId/questions/:questionId`

**Response:**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

**Note:** After deletion, remaining questions should be reordered (order field updated)

#### 2.5 Reorder Questions
**PUT** `/api/surveys/:surveyId/questions/reorder`

**Request Body:**
```json
{
  "questionIds": ["question-124", "question-123", "question-125"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "question-124",
        "order": 0
      },
      {
        "id": "question-123",
        "order": 1
      },
      {
        "id": "question-125",
        "order": 2
      }
    ]
  }
}
```

**Note:** Updates the `order` field for all questions based on the array order

---

### 3. Response Management

#### 3.1 Get Responses for Survey
**GET** `/api/surveys/:surveyId/responses`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `startDate` (optional): Filter by submission date (ISO 8601)
- `endDate` (optional): Filter by submission date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "responses": [
      {
        "id": "response-123",
        "surveyId": "survey-123",
        "userId": "user-789",
        "email": "respondent@example.com",
        "answers": {
          "question-123": "4",
          "question-124": ["Feature A", "Feature B"]
        },
        "submittedAt": "2024-01-20T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

**Authorization:** User must be survey creator or have organization admin rights

#### 3.2 Get Response by ID
**GET** `/api/surveys/:surveyId/responses/:responseId`

**Response:**
```json
{
  "success": true,
  "data": {
    "response": {
      "id": "response-123",
      "surveyId": "survey-123",
      "userId": "user-789",
      "email": "respondent@example.com",
      "answers": {
        "question-123": "4",
        "question-124": ["Feature A", "Feature B"],
        "question-125": "2024-01-20"
      },
      "submittedAt": "2024-01-20T15:30:00Z"
    }
  }
}
```

#### 3.3 Submit Survey Response (Public Endpoint)
**POST** `/api/surveys/:surveyId/responses`

**Request Body:**
```json
{
  "userId": "user-789",
  "email": "respondent@example.com",
  "answers": {
    "question-123": "4",
    "question-124": ["Feature A", "Feature B"],
    "question-125": "2024-01-20"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": {
      "id": "response-123",
      "surveyId": "survey-123",
      "userId": "user-789",
      "email": "respondent@example.com",
      "answers": {
        "question-123": "4",
        "question-124": ["Feature A", "Feature B"],
        "question-125": "2024-01-20"
      },
      "submittedAt": "2024-01-20T15:30:00Z"
    }
  }
}
```

**Validation Rules:**
- Survey must exist and have status 'Published'
- All required questions must have answers
- Answer types must match question types:
  - `short-text`, `long-text`, `date`: string
  - `multiple-choice`: string (single option)
  - `checkbox`: array of strings
  - `rating`: string (number as string, 1-5)
- For `multiple-choice` and `checkbox`, answers must be one of the question's options

#### 3.4 Delete Response
**DELETE** `/api/surveys/:surveyId/responses/:responseId`

**Response:**
```json
{
  "success": true,
  "message": "Response deleted successfully"
}
```

**Authorization:** User must be survey creator, organization admin, or the respondent

---

### 4. Public Survey Access

#### 4.1 Get Published Survey with Questions
**GET** `/api/public/surveys/:surveyId`

**Response:**
```json
{
  "success": true,
  "data": {
    "survey": {
      "id": "survey-123",
      "name": "Customer Satisfaction Survey",
      "description": "Annual customer feedback",
      "status": "Published",
      "background": {
        "type": "gradient",
        "value": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }
    },
    "questions": [
      {
        "id": "question-123",
        "title": "How satisfied are you?",
        "description": "Rate your overall satisfaction",
        "type": "rating",
        "required": true,
        "options": null,
        "order": 0
      }
    ]
  }
}
```

**Note:** This endpoint should only return surveys with status 'Published'. No authentication required.

---

## Error Responses

All endpoints should return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name must be at least 2 characters"
      }
    ]
  }
}
```

### Common Error Codes:
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: User doesn't have permission
- `SURVEY_NOT_PUBLISHED`: Survey is not available for responses
- `INVALID_ANSWER_TYPE`: Answer type doesn't match question type
- `MISSING_REQUIRED_ANSWER`: Required question not answered

---

## Business Logic Requirements

### 1. Survey Status
- Only 'Published' surveys can accept responses
- Draft and Archived surveys cannot be accessed via public endpoint
- Users can only edit/delete surveys they created (unless org admin)

### 2. Question Validation
- When creating/updating questions with type 'multiple-choice' or 'checkbox', `options` array must have at least 1 item
- Options should be unique within a question
- Question `order` should be auto-incremented if not provided

### 3. Response Validation
- All required questions must have answers
- Answer values must match question types:
  - `short-text`, `long-text`, `date`: string
  - `multiple-choice`: string (must be one of the options)
  - `checkbox`: array of strings (all must be valid options)
  - `rating`: string representing number 1-5
- Survey must be 'Published' to accept responses

### 4. Authorization
- Users can only edit/delete surveys they created
- Organization admins can manage org-wide surveys
- Public endpoint doesn't require authentication
- Response deletion: creator, org admin, or respondent can delete

### 5. Data Integrity
- Deleting a survey should cascade delete questions and responses (or mark as archived)
- Reordering questions should update all affected order values atomically
- `createdAt` should be set on creation and never changed
- `updatedAt` should be updated on every modification
- `submittedAt` should be set when response is submitted

---

## Database Schema Recommendations

### Surveys Table
```sql
CREATE TABLE surveys (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('Draft', 'Published', 'Archived') NOT NULL DEFAULT 'Draft',
  background_type ENUM('gradient', 'image'),
  background_value TEXT,
  user_id VARCHAR(255),
  organization_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_status (status)
);
```

### Questions Table
```sql
CREATE TABLE questions (
  id VARCHAR(255) PRIMARY KEY,
  survey_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  type ENUM('short-text', 'long-text', 'multiple-choice', 'checkbox', 'rating', 'date') NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  options JSON,
  `order` INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  INDEX idx_survey_id (survey_id),
  INDEX idx_order (survey_id, `order`)
);
```

### Responses Table
```sql
CREATE TABLE responses (
  id VARCHAR(255) PRIMARY KEY,
  survey_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  email VARCHAR(255),
  answers JSON NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  INDEX idx_survey_id (survey_id),
  INDEX idx_user_id (user_id),
  INDEX idx_submitted_at (submitted_at)
);
```

---

## Additional Considerations

1. **Export Functionality:** Consider adding endpoints for CSV/PDF export of responses
   - `GET /api/surveys/:surveyId/responses/export?format=csv`
   - `GET /api/surveys/:surveyId/responses/export?format=pdf`

2. **Analytics:** Consider adding endpoints for response statistics
   - `GET /api/surveys/:surveyId/analytics` - Response counts, completion rates, etc.

3. **Templates:** Consider storing survey templates for quick creation
   - `GET /api/survey-templates`
   - `POST /api/surveys/from-template/:templateId`
   - `POST /api/surveys/:surveyId/apply-template` (Already implemented - see 1.6)

4. **Rate Limiting:** Apply rate limiting to public response submission endpoint to prevent spam

5. **Validation:** Implement comprehensive server-side validation for all inputs

6. **CORS:** Configure CORS for public endpoints if needed

7. **Caching:** Consider caching published surveys for better performance

8. **Soft Delete:** Consider implementing soft delete for surveys (mark as archived instead of hard delete)

---

## Frontend Integration Notes

The frontend currently uses these Redux actions that need to be replaced with API calls:

### Survey Actions:
- `addSurvey` → `POST /api/surveys`
- `updateSurvey` → `PUT /api/surveys/:surveyId`
- `deleteSurvey` → `DELETE /api/surveys/:surveyId`
- `applyTemplate` → `POST /api/surveys/:surveyId/apply-template` (Applies template background and creates questions)

### Question Actions:
- `addQuestion` → `POST /api/surveys/:surveyId/questions`
- `updateQuestion` → `PUT /api/surveys/:surveyId/questions/:questionId`
- `deleteQuestion` → `DELETE /api/surveys/:surveyId/questions/:questionId`
- `reorderQuestions` → `PUT /api/surveys/:surveyId/questions/reorder`
- `setQuestions` → `GET /api/surveys/:surveyId/questions`

### Response Actions:
- `addResponse` → `POST /api/surveys/:surveyId/responses`
- `deleteResponse` → `DELETE /api/surveys/:surveyId/responses/:responseId`
- `setResponses` → `GET /api/surveys/:surveyId/responses`

### Public Form:
- Load survey → `GET /api/public/surveys/:surveyId`
- Submit response → `POST /api/surveys/:surveyId/responses`

---

## Example Request/Response Flows

### Complete Flow: Create Survey → Add Questions → Publish → Submit Response

1. **Create Survey:**
```bash
POST /api/surveys
{
  "name": "Employee Feedback",
  "description": "Quarterly employee satisfaction survey",
  "status": "Draft"
}
```

2. **Add Questions:**
```bash
POST /api/surveys/survey-123/questions
{
  "title": "How satisfied are you with your work?",
  "type": "rating",
  "required": true
}

POST /api/surveys/survey-123/questions
{
  "title": "What department do you work in?",
  "type": "multiple-choice",
  "required": true,
  "options": ["Engineering", "Sales", "Marketing", "HR"]
}
```

3. **Publish Survey:**
```bash
PUT /api/surveys/survey-123
{
  "status": "Published"
}
```

4. **Submit Response (Public):**
```bash
POST /api/surveys/survey-123/responses
{
  "email": "employee@example.com",
  "answers": {
    "question-123": "4",
    "question-124": "Engineering"
  }
}
```

5. **View Responses (Admin):**
```bash
GET /api/surveys/survey-123/responses
```

---

## Questions for Backend Developer

1. What authentication mechanism will be used? (JWT, OAuth, etc.)
2. What database system will be used? (MySQL, PostgreSQL, MongoDB, etc.)
3. Should we implement soft delete for surveys/responses?
4. Do we need to support file uploads for survey backgrounds?
5. Should responses be editable after submission?
6. Do we need to support survey versioning?
7. Should we implement survey sharing/duplication functionality?

---

**Document Version:** 1.0  
**Last Updated:** 2024-01-20  
**Contact:** Frontend Development Team

