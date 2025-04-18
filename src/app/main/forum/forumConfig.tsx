import { lazy } from "react";
const ForumView = lazy(() => import("./forum"));
import authRoles from 'src/app/auth/authRoles';

const ForumConfig = {
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
  auth: [authRoles.Admin, authRoles.Trainer, authRoles.Learner, authRoles.Employer, authRoles.IQA, authRoles.LIQA], 
  routes: [
    {
      path: "/forum",
      element: <ForumView />
    },
  ],
};

export default ForumConfig;
