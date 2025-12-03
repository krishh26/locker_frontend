import { lazy } from 'react'
import authRoles from 'src/app/auth/authRoles'

const QASamplePlanPage = lazy(() => import('./index'))
const ExamineEvidencePage = lazy(() => import('./components/ExamineEvidencePage'))

const QASamplePlanConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: true,
        },
        toolbar: {
          display: true,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: true,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  auth: [authRoles.Admin ,authRoles.IQA],
  routes: [
    {
      path: '/qa-sample-plan',
      element: <QASamplePlanPage />,
    },
    {
      path: '/qa-sample-plan/examine-evidence',
      element: <ExamineEvidencePage />,
    },
    {
      path: '/sample-plan/:planDetailId/evidence',
      element: <ExamineEvidencePage />,
    },
  ],
}

export default QASamplePlanConfig

