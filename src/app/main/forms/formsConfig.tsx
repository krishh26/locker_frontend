import { lazy } from "react";
const FormsView = lazy(() => import("./forms"));
import authRoles from 'src/app/auth/authRoles';
import AddForms from "./addForms";

const FormsConfig = {
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
  auth: [ authRoles.Trainer, authRoles.Learner, authRoles.Employer, authRoles.IQA, authRoles.EQA, authRoles.Admin, authRoles.LIQA], 
  routes: [
    {
      path: "/forms",
      element: <FormsView />
    },
    {
      path: "/forms/create",
      element: <AddForms />
    },
  ],
};

export default FormsConfig;
