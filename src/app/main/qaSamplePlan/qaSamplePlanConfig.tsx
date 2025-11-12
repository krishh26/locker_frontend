import { lazy } from 'react'
import authRoles from 'src/app/auth/authRoles'

const QASamplePlanPage = lazy(() => import('./index'))

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
  ],
}

export default QASamplePlanConfig

