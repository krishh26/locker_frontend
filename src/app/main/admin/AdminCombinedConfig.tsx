import { lazy } from 'react'
import authRoles from 'src/app/auth/authRoles'
const LearnerManagement = lazy(() => import('./learnerManagement'))

const AdminCombinedConfig = {
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
      path: '/learner-list',
      element: <LearnerManagement />,
    },
  ],
}

export default AdminCombinedConfig
