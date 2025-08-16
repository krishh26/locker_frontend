import { lazy } from "react";
const TrainerRiskRating = lazy(() => import("./trainer-risk-rating"));
import authRoles from 'src/app/auth/authRoles';

const TrainerRiskRatingConfig = {
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
  auth: [authRoles.Admin,],
  routes: [
    {
      path: "/trainer-risk-rating",
      element: <TrainerRiskRating />
    },
  ],
};

export default TrainerRiskRatingConfig;
