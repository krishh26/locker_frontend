import { lazy } from "react";
const CreateAssignmentView = lazy(() => import("./createAssignment"));
import authRoles from 'src/app/auth/authRoles';

const CreateAssignmentConfig = {
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
  auth: [authRoles.Learner, authRoles.Trainer, authRoles.Admin],
  routes: [
    {
      path: "/createAssignment",
      element: <CreateAssignmentView />
    }
  ],
};

export default CreateAssignmentConfig;
