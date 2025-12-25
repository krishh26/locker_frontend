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
    selectedCourses: Yup.array()
      .min(1, 'Please select at least one course')
      .required('Please select at least one course'),
    courseSelectedTypes: Yup.object()
      .test(
        'standard-course-type-required',
        'Please select a type for all Standard courses',
        function (courseSelectedTypes, context) {
          const selectedCourses = context.parent.selectedCourses
          if (!Array.isArray(selectedCourses) || selectedCourses.length === 0) {
            return true // Let selectedCourses validation handle this
          }
          
          const standardCourses = selectedCourses.filter(
            (c: any) => c?.course_core_type === 'Standard'
          )
          
          if (standardCourses.length === 0) {
            return true // No Standard courses, validation passes
          }
          
          // Check if all Standard courses have a type selected
          return standardCourses.every((course: any) => {
            const courseId = course?.course_id
            return courseId && courseSelectedTypes && courseSelectedTypes[courseId]
          })
        }
      ),
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
              function (subUnits) {
                const unit = this.parent
                
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
                  // Also check if unit-level learnerMap is selected (for units that might have both)
                  const hasUnitLearnerMap = unitLearnerMap === true
                  
                  // Try to determine if this is a Qualification course unit
                  // In Yup tests, we can access parent values but not easily root values
                  // Try to access through options.context if available
                  let isQualificationCourse = false
                  try {
                    const rootValue = (this as any).options?.context
                    if (rootValue && rootValue.selectedCourses) {
                      const selectedCourses = rootValue.selectedCourses || []
                      const course = selectedCourses.find((c: any) => c?.course_id === unit.course_id)
                      isQualificationCourse = course?.course_core_type === 'Qualification'
                    }
                  } catch (e) {
                    // Context not available, will use fallback logic
                  }
                  
                  // For Qualification courses, require at least one learnerMap per unit (strict - no exceptions)
                  if (isQualificationCourse) {
                    // Each Qualification unit MUST have at least one subUnit with learnerMap selected
                    if (!hasSubUnitLearnerMap && !hasUnitLearnerMap) {
                      // Return false to fail validation - this will create an error
                      return false
                    }
                    return true
                  }
                  
                  // For Standard courses (Duty type) OR if we can't determine course type:
                  // If neither subUnit nor unit-level learnerMap is selected, check if this appears to be a newly added unit
                  if (!hasSubUnitLearnerMap && !hasUnitLearnerMap) {
                    // Check if all subUnits have default values (indicating unit was just added)
                    const allSubUnitsHaveDefaults = subUnits.every((s) => 
                      s?.learnerMap === false && 
                      s?.trainerMap === false && 
                      s?.signedOff === false &&
                      (!s?.comment || s.comment === '')
                    )
                    
                    // If all subUnits have defaults, allow the unit to exist without validation (only for Standard courses)
                    // This gives the user a chance to select learnerMap checkboxes
                    // The form-level validation will catch if no learnerMap is selected on submit
                    // NOTE: If we can't determine course type (context not available), we allow this for now
                    // The form-level validation will catch Qualification course issues
                    if (allSubUnitsHaveDefaults && !unitLearnerMap && !unit.trainerMap && !unit.signedOff) {
                      return true
                    }
                  }
                  
                  // Validation passes if either subUnit or unit-level learnerMap is selected
                  return hasSubUnitLearnerMap || hasUnitLearnerMap
                }
                
                // If unit has no subUnits (Knowledge/Behaviour/Skills or other types)
                if (!hasSubUnits) {
                  // Try to determine if this is a Qualification course unit
                  const rootValue2 = (this as any).options?.context
                  const selectedCourses2 = rootValue2?.selectedCourses || []
                  const course2 = selectedCourses2.find((c: any) => c?.course_id === unit.course_id)
                  const isQualificationCourse2 = course2?.course_core_type === 'Qualification'
                  
                  // For Knowledge/Behaviour/Skills: validate unit-level learnerMap
                  if (isUnitWithoutSubUnits) {
                    // For Qualification courses, require learnerMap (no exceptions)
                    if (isQualificationCourse2) {
                      if (!unitLearnerMap) {
                        return this.createError({
                          message: `Learner Map must be selected for ${unit.title || 'this unit'}`,
                        })
                      }
                      return true
                    }
                    // For Standard courses, allow newly added units
                    if (!unitLearnerMap && !unit.trainerMap && !unit.signedOff && (!unit.comment || unit.comment === '')) {
                      return true // Allow newly added unit without immediate validation
                    }
                    // Unit is selected (has course_id), so learnerMap must be true
                    return unitLearnerMap === true
                  }
                  // For other units without subUnits
                  // For Qualification courses, require learnerMap (no exceptions)
                  if (isQualificationCourse2) {
                    if (!unitLearnerMap) {
                      return this.createError({
                        message: `Learner Map must be selected for ${unit.title || 'this unit'}`,
                      })
                    }
                    return true
                  }
                  // For Standard courses, allow newly added units
                  if (!unitLearnerMap && !unit.trainerMap && !unit.signedOff && (!unit.comment || unit.comment === '')) {
                    return true // Allow newly added unit without immediate validation
                  }
                  // Require unit-level learnerMap
                  return unitLearnerMap === true
                }
                
                // Default: return true to allow unit to exist without immediate validation
                // The form-level validation will catch if no learnerMap is selected on submit
                return true
              }
            ),
        })
          .test(
            'qualification-unit-learnerMap-required',
            'At least one sub unit must have Learner Map selected for this unit',
            function (unit) {
              // If unit has course_id, it means it belongs to a selected course and should be validated
              if (!unit?.course_id) {
                return true // Skip validation for units not associated with selected courses
              }
              
              // Try to determine if this is a Qualification course unit
              let isQualificationCourse = false
              try {
                const rootValue = (this as any).options?.context
                if (rootValue && rootValue.selectedCourses) {
                  const selectedCourses = rootValue.selectedCourses || []
                  const course = selectedCourses.find((c: any) => c?.course_id === unit.course_id)
                  isQualificationCourse = course?.course_core_type === 'Qualification'
                }
              } catch (e) {
                // Context not available
              }
              
              // Only validate Qualification course units at this level
              if (!isQualificationCourse) {
                return true
              }
              
              // Check if unit has subUnits
              const hasSubUnits = unit?.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0
              
              if (hasSubUnits) {
                // Check if any subUnit has learnerMap selected
                const hasSubUnitLearnerMap = unit.subUnit.some((s: any) => s?.learnerMap === true)
                const hasUnitLearnerMap = unit?.learnerMap === true
                
                // For Qualification courses, require at least one learnerMap
                if (!hasSubUnitLearnerMap && !hasUnitLearnerMap) {
                  return false // This will create an error at errors.units[index]
                }
              } else {
                // Unit without subUnits - check unit-level learnerMap
                if (!unit?.learnerMap) {
                  return false // This will create an error at errors.units[index]
                }
              }
              
              return true
            }
          )
      )
      .min(1, 'Select at least one unit')
      .test(
        'at-least-one-unit-with-learnerMap-per-course',
        'At least one unit must have Learner Map selected for each selected course',
        function (units) {
          if (!Array.isArray(units) || units.length === 0) return false
          
          // Get selectedCourses from root form values
          const selectedCourses = (this.options?.context as any)?.selectedCourses || []
          
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
            const course = selectedCourses.find((c: any) => String(c?.course_id) === courseId)
            const isQualificationCourse = course?.course_core_type === 'Qualification'
            
            // For Qualification courses: EACH unit must have at least one learnerMap selected
            if (isQualificationCourse) {
              return courseUnits.every((unit) => {
                const hasSubUnits = unit?.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0
                if (hasSubUnits) {
                  return unit.subUnit.some((s) => s?.learnerMap === true)
                } else {
                  return unit?.learnerMap === true
                }
              })
            }
            
            // For Standard courses: at least ONE unit in the course must have learnerMap selected
            return courseUnits.some((unit) => {
              // Check if this is a Knowledge, Behaviour, or Skills unit (no subUnits)
              const isUnitWithoutSubUnits = ['Knowledge', 'Behaviour', 'Skills'].includes(unit?.type || '')
              
              // Check if unit has subUnits
              const hasSubUnits = unit?.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0
              
              if (hasSubUnits) {
                // Check subUnit learnerMap (for Duty units)
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
