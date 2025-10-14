import { lazy } from "react";
const DocsToSignView = lazy(() => import("./index"));
import authRoles from 'src/app/auth/authRoles';

const DocsToSignConfig = {
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
  auth: [authRoles.Admin, authRoles.Trainer, authRoles.Learner, authRoles.Employer, authRoles.IQA],
  routes: [
    {
      path: "/docs-to-sign",
      element: <DocsToSignView />
    },
  ],
};

export default DocsToSignConfig;
