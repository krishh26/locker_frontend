import { lazy } from 'react'
import { authRoles } from 'src/app/auth'

const LearnerDashboardPage = lazy(() => import('./LearnerDashboardPage'))

const learnerDashboardConfig = {
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
          display: true,
        },
      },
    },
  },
  auth: [authRoles.Admin, authRoles.Trainer],
  routes: [
    {
      path: '/learner-dashboard/:id',
      element: <LearnerDashboardPage />,
    },
    {
      path: '/learner-dashboard',
      element: <LearnerDashboardPage />,
    },
  ],
}

export default learnerDashboardConfig
