import { lazy } from "react";
const CourseBuilderView = lazy(() => import("./courseBuilder"));
import authRoles from 'src/app/auth/authRoles';
import CourseBuilder from "src/app/component/Courses";
import NewCourseBuilder from "src/app/component/Courses/NewCourseBuilder";

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
      path: "/courseBuilder/course",
      element: <NewCourseBuilder />
    },
    {
      path: "/courseBuilder/course/:courseId",
      element: <NewCourseBuilder />
    },
    {
      path: "/courseBuilder/view/:courseId",
      element: <CourseBuilder edit="view" />
    }
  ],
};

export default CourseBuilderConfig;
