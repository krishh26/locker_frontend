import { lazy } from "react";
import authRoles from 'src/app/auth/authRoles';

const SessionList = lazy(() => import("./session-list"));
const AddEditSession = lazy(() => import("./add-edit-session"));

const LearningPlanConfig = {
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
  auth: [authRoles.Trainer ,authRoles.Admin],
  routes: [
    {
      path: "/session-list/:id",
      element: <SessionList/>
    },
    {
    path: '/add-session',
    element: <AddEditSession/>
    }
  ],
};

export default LearningPlanConfig;
