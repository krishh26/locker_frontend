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
              'at-least-one-learnerMap',
              "Each unit must have at least one sub unit or unit-level Learner's Map selected",
              function (subUnits, context) {
                const unit = context.parent
                // Check if this is a Knowledge, Behaviour, or Skills unit (no subUnits)
                const isUnitWithoutSubUnits = ['Knowledge', 'Behaviour', 'Skills'].includes(unit?.type || '')
                
                // Check if subUnits array exists and has items
                const hasSubUnits = subUnits && Array.isArray(subUnits) && subUnits.length > 0
                
                // For Standard courses: Only validate units that are actually selected (have learnerMap)
                // If unit doesn't have learnerMap selected, skip validation (it's just displayed, not selected)
                const unitLearnerMap = unit?.learnerMap
                
                // If unit has subUnits, check subUnit learnerMap
                if (hasSubUnits) {
                  // Check if any subUnit has learnerMap selected
                  const hasSubUnitLearnerMap = subUnits.some((s) => s?.learnerMap === true)
                  // If no subUnit has learnerMap, this unit is not selected - skip validation
                  if (!hasSubUnitLearnerMap) {
                    return true // Skip validation for unselected units
                  }
                  return hasSubUnitLearnerMap
                }
                
                // If unit has no subUnits (Knowledge/Behaviour/Skills or other types)
                if (!hasSubUnits) {
                  // For Knowledge/Behaviour/Skills: only validate if unit-level learnerMap is selected
                  // If learnerMap is false/undefined, the unit is just displayed, not selected - skip validation
                  if (isUnitWithoutSubUnits) {
                    // Only validate if learnerMap is explicitly set (selected)
                    // If learnerMap is false or undefined, skip validation
                    if (unitLearnerMap === false || unitLearnerMap === undefined) {
                      return true // Skip validation - unit is displayed but not selected
                    }
                    return unitLearnerMap === true
                  }
                  // For other units without subUnits, skip validation
                  return true
                }
                
                // Default: return false if no conditions are met
                return false
              }
            ),
        })
      )
      .min(1, 'Select at least one unit')
      .test(
        'at-least-one-unit-with-learnerMap',
        'At least one unit must have Learner Map selected',
        function (units) {
          if (!Array.isArray(units) || units.length === 0) return false
          
          return units.some((unit) => {
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
