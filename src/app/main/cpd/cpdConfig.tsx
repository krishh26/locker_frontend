import { lazy } from "react";
const CpdView = lazy(() => import("./cpd"));
import authRoles from 'src/app/auth/authRoles';

const CpdConfig = {
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
  auth: [authRoles.Trainer, authRoles.Learner, authRoles.IQA, authRoles.LIQA, authRoles.Admin],
  routes: [
    {
      path: "/cpd",
      element: <CpdView />
    },
  ],
};

export default CpdConfig;
