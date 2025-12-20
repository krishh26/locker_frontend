import * as Yup from 'yup'

export const getValidationSchema = (userRole?: string) => {
  const canEditDeclaration = ['Trainer', 'Admin', 'IQA'].includes(userRole || '')
  
  return Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    trainer_feedback: Yup.string(),
    points_for_improvement: Yup.string(),
    audio: Yup.mixed().required('File is required'),
    learner_comments: Yup.string(),
    evidence_time_log: Yup.boolean().required('Please select one option'),
    session: Yup.string(),
    grade: Yup.string(),
    declaration: canEditDeclaration 
      ? Yup.bool().optional()
      : Yup.bool().oneOf([true], 'You must accept the declaration'),
    assessment_method: Yup.array()
      .of(Yup.string())
      .min(1, 'Please select at least one assessment method.'),
    units: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.mixed().required(),
          title: Yup.string().required(),
          type: Yup.string().optional(),
          code: Yup.string().optional(),
          course_id: Yup.mixed().optional(),
          // Unit-level properties for Standard courses (units without subUnits)
          learnerMap: Yup.boolean().optional(),
          trainerMap: Yup.boolean().optional(),
          signedOff: Yup.boolean().optional(),
          comment: Yup.string().optional(),
          // SubUnits array (optional for Standard courses, required for Qualification)
          subUnit: Yup.array()
            .of(
              Yup.object().shape({
                id: Yup.string().required(),
                title: Yup.string().required(),
                learnerMap: Yup.boolean().optional(),
                trainerMap: Yup.boolean().optional(),
                signedOff: Yup.boolean().optional(),
                comment: Yup.string().optional(),
              })
            )
            .optional()
            .test(
              'at-least-one-learnerMap-if-unit-selected',
              "If a unit is selected, at least one sub unit or unit-level Learner's Map must be selected",
              function (subUnits, context) {
                const unit = context.parent
                
                // If unit has course_id, it means it belongs to a selected course and should be validated
                // Units without course_id are not part of selected courses, skip validation
                if (!unit?.course_id) {
                  return true // Skip validation for units not associated with selected courses
                }
                
                // Check if this is a Knowledge, Behaviour, or Skills unit (no subUnits)
                const isUnitWithoutSubUnits = ['Knowledge', 'Behaviour', 'Skills'].includes(unit?.type || '')
                
                // Check if subUnits array exists and has items
                const hasSubUnits = subUnits && Array.isArray(subUnits) && subUnits.length > 0
                
                const unitLearnerMap = unit?.learnerMap
                
                // If unit has subUnits, check subUnit learnerMap
                if (hasSubUnits) {
                  // Check if any subUnit has learnerMap selected
                  const hasSubUnitLearnerMap = subUnits.some((s) => s?.learnerMap === true)
                  // If unit is selected (has course_id) but no subUnit has learnerMap, validation fails
                  return hasSubUnitLearnerMap
                }
                
                // If unit has no subUnits (Knowledge/Behaviour/Skills or other types)
                if (!hasSubUnits) {
                  // For Knowledge/Behaviour/Skills: validate unit-level learnerMap
                  if (isUnitWithoutSubUnits) {
                    // Unit is selected (has course_id), so learnerMap must be true
                    return unitLearnerMap === true
                  }
                  // For other units without subUnits, require unit-level learnerMap
                  return unitLearnerMap === true
                }
                
                // Default: return false if no conditions are met
                return false
              }
            ),
        })
      )
      .min(1, 'Select at least one unit')
      .test(
        'at-least-one-unit-with-learnerMap-per-course',
        'At least one unit must have Learner Map selected for each selected course',
        function (units) {
          if (!Array.isArray(units) || units.length === 0) return false
          
          // Group units by course_id
          const unitsByCourse = units.reduce((acc, unit) => {
            if (unit?.course_id) {
              const courseId = String(unit.course_id)
              if (!acc[courseId]) {
                acc[courseId] = []
              }
              acc[courseId].push(unit)
            }
            return acc
          }, {} as Record<string, any[]>)
          
          // Check each course has at least one unit with learnerMap selected
          const courseIds = Object.keys(unitsByCourse)
          if (courseIds.length === 0) return false
          
          return courseIds.every((courseId) => {
            const courseUnits = unitsByCourse[courseId]
            return courseUnits.some((unit) => {
              // Check if this is a Knowledge, Behaviour, or Skills unit (no subUnits)
              const isUnitWithoutSubUnits = ['Knowledge', 'Behaviour', 'Skills'].includes(unit?.type || '')
              
              // Check if unit has subUnits
              const hasSubUnits = unit?.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0
              
              if (hasSubUnits) {
                // Check subUnit learnerMap (for Duty units or Qualification courses)
                return unit.subUnit.some((s) => s?.learnerMap === true)
              } else if (isUnitWithoutSubUnits) {
                // For Knowledge, Behaviour, Skills: treat unit itself as subUnit
                // Check unit-level learnerMap
                return unit?.learnerMap === true
              } else {
                // Fallback: check unit-level learnerMap (for other cases)
                return unit?.learnerMap === true
              }
            })
          })
        }
      ),
    signatures: Yup.array()
      .of(
        Yup.object().shape({
          role: Yup.string(),
          name: Yup.string(),
          signed: Yup.boolean(),
          es: Yup.string(),
          date: Yup.string(),
          signature_required: Yup.boolean(),
        })
      )
      .optional(),
  })
}
