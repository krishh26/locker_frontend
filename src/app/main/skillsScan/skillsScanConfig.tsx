import { lazy } from "react";
const SkillsScanView = lazy(() => import("./skillsScan"));
import authRoles from 'src/app/auth/authRoles';

const SkillsScanConfig = {
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
      path: "/skillsScan",
      element: <SkillsScanView />
    },
  ],
};

export default SkillsScanConfig;
