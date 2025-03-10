import { lazy } from "react";
const SamplingPlanView = lazy(() => import("./samplingPlan"));
import authRoles from 'src/app/auth/authRoles';

const SamplingPlanConfig = {
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
  auth: [authRoles.Admin, authRoles.IQA, authRoles.LIQA],
  routes: [
    {
      path: "/samplingPlan",
      element: <SamplingPlanView />
    },
  ],
};

export default SamplingPlanConfig;
