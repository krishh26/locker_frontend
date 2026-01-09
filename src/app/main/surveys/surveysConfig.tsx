import { lazy } from 'react';
const SurveysView = lazy(() => import('./surveys'));
const SurveyBuilder = lazy(() => import('./builder/survey-builder'));
const ResponsesView = lazy(() => import('./responses/responses'));
import authRoles from 'src/app/auth/authRoles';

const SurveysConfig = {
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
  auth: [authRoles.Trainer, authRoles.Admin, authRoles.IQA, authRoles.LIQA],
  routes: [
    {
      path: '/surveys',
      element: <SurveysView />,
    },
    {
      path: '/surveys/:surveyId/builder',
      element: <SurveyBuilder />,
    },
    {
      path: '/surveys/:surveyId/responses',
      element: <ResponsesView />,
    },
  ],
};

export default SurveysConfig;

