import { lazy } from "react";
const CaseloadView = lazy(() => import("./caseload"));
import authRoles from 'src/app/auth/authRoles';

const CaseloadConfig = {
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
  auth: [authRoles.Trainer], 
  routes: [
    {
      path: "/caseload",
      element: <CaseloadView />
    },
  ],
};

export default CaseloadConfig;
