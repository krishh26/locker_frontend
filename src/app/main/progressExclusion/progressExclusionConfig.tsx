import { lazy } from "react";
import authRoles from 'src/app/auth/authRoles';
const ProgressExclusion = lazy(() => import("./index"));

const ProgressExclusionConfig = {
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
      path: "/progress-exclusion",
      element: <ProgressExclusion />,
    },
  ],
};

export default ProgressExclusionConfig;
