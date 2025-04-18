import { lazy } from "react";
const CourseBuilderView = lazy(() => import("./courseBuilder"));
import authRoles from 'src/app/auth/authRoles';
import CourseBuilder from "src/app/component/Courses";

const CourseBuilderConfig = {
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
      path: "/courseBuilder",
      element: <CourseBuilderView />
    },
    {
      path:"/courseBuilder/course",
      element: <CourseBuilder />
    }
  ],
};

export default CourseBuilderConfig;
