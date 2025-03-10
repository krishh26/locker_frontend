import { lazy } from "react";
const SamplingPlanAllocationView = lazy(() => import("./samplingPlanAllocation"));
import authRoles from 'src/app/auth/authRoles';

const SamplingPlanAllocationConfig = {
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
  auth: [authRoles.IQA, authRoles.LIQA], 
  routes: [
    {
      path: "/samplingPlanAllocation",
      element: <SamplingPlanAllocationView />
    },
  ],
};

export default SamplingPlanAllocationConfig;
