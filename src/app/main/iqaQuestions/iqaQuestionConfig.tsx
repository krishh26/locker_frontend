import { lazy } from 'react'
import { authRoles } from 'src/app/auth'

const IQAQuestions = lazy(() => import('./index'))

const IQAQuestionConfig = {
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
      path: '/iqa-questions',
      element: <IQAQuestions />,
    },
  ],
}

export default IQAQuestionConfig