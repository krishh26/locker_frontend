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
                // If unit has subUnits, check subUnit learnerMap
                if (subUnits && Array.isArray(subUnits) && subUnits.length > 0) {
                  return subUnits.some((s) => s?.learnerMap === true)
                }
                // If unit has no subUnits, check unit-level learnerMap (for Standard courses)
                return unit?.learnerMap === true
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
            // Check if unit has subUnits
            const hasSubUnits = unit?.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0
            
            if (hasSubUnits) {
              // Check subUnit learnerMap
              return unit.subUnit.some((s) => s?.learnerMap === true)
            } else {
              // Check unit-level learnerMap (for Standard courses)
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
