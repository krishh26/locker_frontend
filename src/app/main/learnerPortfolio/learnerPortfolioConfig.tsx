import { lazy } from "react";
const LearnerPortfolioView = lazy(() => import("./learnerPortfolio"));
import authRoles from 'src/app/auth/authRoles';

const LearnerPortfolioConfig = {
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
  auth: [authRoles.IQA],
  routes: [
    {
      path: "/learnerPortfolio",
      element: <LearnerPortfolioView />
    },
  ],
};

export default LearnerPortfolioConfig;
