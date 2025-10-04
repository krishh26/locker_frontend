import { lazy } from 'react'
import authRoles from 'src/app/auth/authRoles'

const DefaultReviewWeeksView = lazy(() => import('./defaultReviewWeeks'))

const DefaultReviewWeeksConfig = {
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
      path: '/default-review-weeks',
      element: <DefaultReviewWeeksView />,
    },
  ],
}

export default DefaultReviewWeeksConfig
