import { lazy } from "react";
const AdminView = lazy(() => import("./admin"));
const UserManagement = lazy(() => import("./userManagement"));
const LearnerManagement = lazy(() => import("./learnerManagement"));
const EmployerManagement = lazy(() => import("./employerManagement"));
const AdminResources = lazy(() => import("../resources"));
const AddResource = lazy(() => import("../../pages/admin/resources/add"));
const EditResource = lazy(() => import("../../pages/admin/resources/[id]/edit"));
import CreateEmployerDetails from "./employerManagement/userDetails/createEmploye";
import authRoles from 'src/app/auth/authRoles';

const AdminConfig = {
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
  auth: [authRoles.Admin], 
  routes: [
    {
      path: "/admin",
      element: <AdminView />,
    },
    {
      path: "/admin/user",
      element: <UserManagement />,
    },
    {
      path: "/admin/learner",
      element: <LearnerManagement />,
    },
    {
      path: "/admin/employer",
      element: <EmployerManagement />,
    },
    {
      path: "/admin/employer/create-employer",
      element: <CreateEmployerDetails />,
    },
    {
      path: "/admin/resources",
      element: <AdminResources />,
    },
    {
      path: "/admin/resources/add",
      element: <AddResource />,
    },
    {
      path: "/admin/resources/edit/:id",
      element: <EditResource />,
    },
    {
      path: "/admin/resources/view/:id",
      element: <AdminResources />, // TODO: Create ViewResource component
    },
  ],
};

export default AdminConfig;
