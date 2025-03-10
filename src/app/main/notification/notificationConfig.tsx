import { lazy } from "react";
const Notification = lazy(() => import("./notification"));
import authRoles from 'src/app/auth/authRoles';

const NotificationConfig = {
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
  auth: [authRoles.Admin, authRoles.Trainer, authRoles.Learner, authRoles.Employer, authRoles.EQA, authRoles.IQA],
  routes: [
    {
      path: "/notification",
      element: <Notification />
    },
  ],
};

export default NotificationConfig;
