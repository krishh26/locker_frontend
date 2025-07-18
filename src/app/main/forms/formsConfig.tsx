import { lazy } from "react";
const FormsView = lazy(() => import("./forms"));
import authRoles from 'src/app/auth/authRoles';
import AddForms from "./addForms";
import ImprovedFormBuilder from "./ImprovedFormBuilder";
import FormBuilderDemo from "./FormBuilderDemo";
import UserFriendlyFormBuilder from "./UserFriendlyFormBuilder";
import AddViewForm from "./add-view-form";

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
      path: "/forms/create-improved",
      element: <ImprovedFormBuilder />
    },
    {
      path: "/forms/demo",
      element: <FormBuilderDemo />
    },
    {
      path: "/forms/create-simple",
      element: <UserFriendlyFormBuilder />
    },
    {
      path: "/forms/edit/:id",
      element:  <UserFriendlyFormBuilder />
    },
    {
      path: "/forms/view-form/:id",
      element: <AddViewForm />
    },
    {
      path: '/forms/view-saved-form/:id',
      element: <AddViewForm />
    },
    {
      path: "/forms/:id/submit",
      element: <AddViewForm />
    },
  ],
};

export default FormsConfig;
