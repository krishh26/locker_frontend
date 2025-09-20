import { lazy } from "react";
import authRoles from 'src/app/auth/authRoles';

const LearnerWellbeingView = lazy(() => import("./index"));

const LearnerWellbeingConfig = {
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
  auth: [authRoles.Learner],
  routes: [
    {
      path: "/learner-wellbeing",
      element: <LearnerWellbeingView />
    },
  ],
};

export default LearnerWellbeingConfig;
