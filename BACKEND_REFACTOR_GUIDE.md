# Backend Refactoring Guide - Evidence Library

## Overview
The backend has been refactored to separate **Evidence** (global assignment) from **AssignmentMapping** (course/unit mappings). This document outlines the required frontend changes.

## Key Changes Required

### 1. Evidence API Response Structure

**OLD (DO NOT USE):**
```typescript
{
  assignment_id: number
  course_id: { course_id, course_name, course_code }  // ❌ REMOVED
  units: Unit[]  // ❌ REMOVED
  // ... evidence fields
}
```

**NEW:**
```typescript
{
  assignment_id: number
  title: string
  description: string
  trainer_feedback: string
  learner_comments: string
  external_feedback: string
  assessment_method: string[]
  session: string
  grade: string
  status: string
  evidence_time_log: boolean
  file: { name, url, size, key }
  user: { user_id, name }
  created_at: string
  updated_at: string
  // NO course_id, NO units
}
```

### 2. AssignmentMapping Structure

Mappings link evidence to courses/units. Each mapping represents one unit/subunit combination:

```typescript
{
  mapping_id: number
  assignment_id: number
  course_id: number
  unit_ref: string  // unit.code
  sub_unit_ref: string | null  // subunit.code/id for unit+subunit courses, null for unit-only
  learnerMap: boolean
  trainerMap: boolean
  signedOff?: boolean
  comment?: string
}
```

**Important Rules:**
- Unit + SubUnit courses: `sub_unit_ref` = subUnit.code/id
- Unit-only courses: `sub_unit_ref` = null, treat unit itself as PC
- For unit-only: PC actions use `pc_id = unit_code`

### 3. API Endpoints

**Evidence (Assignment) APIs:**
- `GET /assignment/get/{id}` - Get evidence (NO mappings)
- `PATCH /assignment/update/{id}` - Update evidence (NO units/course_id in payload)
- `POST /assignment/{id}/external-feedback` - Upload external feedback

**Mapping APIs:**
- `GET /assignment/{assignment_id}/mappings` - Get all mappings for evidence
- `POST /assignment-mapping/create` - Create new mapping
- `PATCH /assignment-mapping/update/{mapping_id}` - Update mapping
- `DELETE /assignment-mapping/delete/{mapping_id}` - Delete mapping
- `PATCH /assignment-mapping/{mapping_id}/pc` - Update PC ticks (learnerMap/trainerMap/signedOff)

**Signature APIs (Mapping-based):**
- `GET /assignment-mapping/{mapping_id}/signatures` - Get signatures for mapping
- `POST /assignment-mapping/{mapping_id}/request-signature` - Request signature
- `POST /assignment-mapping/{mapping_id}/sign` - Save signature

### 4. Form Submission Flow

**OLD Flow:**
1. Submit evidence with units array containing course_id, learnerMap, trainerMap, etc.
2. Signatures tied to assignment_id

**NEW Flow:**
1. **Update Evidence** (only evidence-level fields):
   ```typescript
   {
     title, description, trainer_feedback, learner_comments,
     assessment_method, session, grade, evidence_time_log
   }
   ```

2. **Create/Update/Delete Mappings** for each course/unit/subunit combination:
   - For each selected course
   - For each selected unit in that course
   - For each subunit (if unit has subunits) OR unit itself (if unit-only)
   - Create/update mapping with learnerMap, trainerMap, signedOff, comment

3. **Request Signatures** per mapping (not per assignment)

### 5. Loading Evidence Details

**OLD:**
- Load evidence → extract units, course_id from response

**NEW:**
1. Load evidence → get evidence-level fields only
2. Load mappings → get all mappings for this evidence
3. Reconstruct UI state:
   - Group mappings by course_id
   - For each course, get course structure from `learnerCoursesData`
   - Match mappings to units/subunits using unit_ref and sub_unit_ref
   - Build form state from mappings + course structure

### 6. Component State Changes

**Remove from FormValues:**
- `units: Unit[]` (no longer part of evidence)

**Add to Component State:**
- `mappings: AssignmentMapping[]` - Current mappings from API
- `selectedCourses: Course[]` - Selected courses (from learnerCoursesData)
- `courseSelectedTypes: Record<course_id, type>` - Selected type for each Standard course
- `unitSelections: Record<course_id, unit_id[]>` - Selected units for each Qualification course

**Form State Structure:**
- Form still tracks units/subunits for UI purposes
- But this is derived from mappings + course structure
- On submit, convert form state → mapping operations

### 7. Signature Handling

**OLD:**
- Signatures stored at assignment level
- `GET /assignment/{id}/signatures`
- `POST /assignment/{id}/request-signature`

**NEW:**
- Signatures stored per mapping
- Each mapping can have different signatures
- Same evidence can be signed in Course A but not Course B
- Use `mapping_id` for all signature operations

### 8. Files to Modify

1. **`src/app/store/api/evidence-api.ts`**
   - ✅ Added mapping endpoints (DONE)
   - ✅ Added mapping-based signature endpoints (DONE)

2. **`src/app/main/evidenceLibrary/createViewEvidenceLibrary.tsx`**
   - ❌ Remove references to `evidenceDetails.data.course_id`
   - ❌ Remove references to `evidenceDetails.data.units`
   - ✅ Add mapping query hooks (DONE)
   - ❌ Update useEffect to load mappings and reconstruct state
   - ❌ Refactor onSubmit to separate evidence update from mapping operations
   - ❌ Update signature handling to be mapping-based

3. **`src/app/main/evidenceLibrary/lib/types.ts`**
   - ❌ Update FormValues to remove units (or keep for UI, but not in payload)
   - ✅ Add AssignmentMapping interface

4. **`src/app/main/evidenceLibrary/evidenceLibrary.tsx`**
   - ❌ Remove references to `evidence.course_id` in list view
   - ❌ Use mapping APIs to show course context

### 9. Implementation Steps

1. **Phase 1: API Infrastructure** ✅
   - Add mapping endpoints to API file

2. **Phase 2: Data Loading**
   - Update useEffect to fetch mappings
   - Reconstruct form state from mappings + course structure
   - Handle case where evidence has no mappings (new evidence)

3. **Phase 3: Form Submission**
   - Separate evidence update payload (no units/course_id)
   - Create/update/delete mappings based on form state
   - Update signature requests to be per-mapping

4. **Phase 4: UI Updates**
   - Update signature table to show per-mapping signatures
   - Update validation to work with mappings
   - Test multi-course scenarios

### 10. Example: Creating Mappings

For a Standard course with Knowledge type, unit has subunits:
```typescript
// For each subunit selected
await createMapping({
  assignment_id: id,
  course_id: course.course_id,
  unit_ref: unit.code,
  sub_unit_ref: subunit.code,  // or subunit.id
  learnerMap: true/false,
  trainerMap: false,
  signedOff: false,
  comment: ''
})
```

For a Qualification course, unit-only:
```typescript
// For each unit selected
await createMapping({
  assignment_id: id,
  course_id: course.course_id,
  unit_ref: unit.code,
  sub_unit_ref: null,  // Unit-only, no subunits
  learnerMap: true/false,
  trainerMap: false,
  signedOff: false,
  comment: ''
})
```

### 11. Important Notes

- **NEVER** send `units` or `course_id` in evidence update payload
- **NEVER** use `assignment_id` for signature/review operations (use `mapping_id`)
- **ALWAYS** use `unit_ref` and `sub_unit_ref` (not unit.id/subunit.id) in mappings
- For unit-only courses, `sub_unit_ref = null` and treat unit as PC
- Signatures are per mapping - same evidence can have different signatures per course

