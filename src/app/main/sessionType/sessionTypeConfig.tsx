import { lazy } from 'react'
import authRoles from 'src/app/auth/authRoles'

const SessionTypeView = lazy(() => import('./sessionType'))

const SessionTypeConfig = {
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
  auth: [authRoles.Admin],
  routes: [
    {
      path: '/session-type',
      element: <SessionTypeView />,
    },
  ],
}

export default SessionTypeConfig

