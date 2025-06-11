import * as Yup from 'yup'

export const getValidationSchema = (isTrainer: boolean) => {
  return Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    trainer_feedback: isTrainer
      ? Yup.string().required('Required')
      : Yup.string(),
    points_for_improvement: isTrainer
      ? Yup.string().required('Required')
      : Yup.string(),
    audio: Yup.mixed().required('File is required'),
    learner_comments: Yup.string(),
    evidence_time_log: Yup.boolean().required('Please select one option'),
    session: Yup.string().required('Session is required'),
    grade: Yup.string(),
    declaration: Yup.bool().oneOf([true], 'You must accept the declaration'),
    assessment_method: Yup.array()
      .of(Yup.string())
      .min(1, 'Please select at least one assessment method.'),
    units: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string().required(),
          title: Yup.string().required(),
          subUnit: Yup.array()
            .of(
              Yup.object().shape({
                id: Yup.number().required(),
                subTitle: Yup.string().required(),
                learnerMap: Yup.boolean(),
                trainerMap: Yup.boolean(),
                comment: Yup.string().optional(),
              })
            )
            .min(1, 'Each unit must have at least one subunit')
            .test(
              'at-least-one-learnerMap',
              "Each unit must have at least one subunit where Learner's Map is selected",
              function (subUnits) {
                if (!Array.isArray(subUnits)) return false
                return subUnits.some((s) => s?.learnerMap === true)
              }
            ),
        })
      )
      .min(1, 'Select at least one unit with at least one subunit'),
  })
}
