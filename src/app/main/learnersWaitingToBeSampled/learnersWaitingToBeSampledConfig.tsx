import { lazy } from "react";
const LearnersWaitingToBeSampledView = lazy(() => import("./index"));
import authRoles from 'src/app/auth/authRoles';

const LearnersWaitingToBeSampledConfig = {
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
      path: "/learners-waiting-to-be-sampled",
      element: <LearnersWaitingToBeSampledView />
    },
  ],
};

export default LearnersWaitingToBeSampledConfig;
