import { lazy } from "react";
const TrainerRiskRatingView = lazy(() => import("./trainerRiskRating"));
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
  auth: [authRoles.IQA, authRoles.LIQA], 
  routes: [
    {
      path: "/trainerRiskRating",
      element: <TrainerRiskRatingView />
    },
  ],
};

export default TrainerRiskRatingConfig;
