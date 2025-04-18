import FuseUtils from "@fuse/utils";
import { Navigate } from "react-router-dom";
import settingsConfig from "app/configs/settingsConfig";
import SignInConfig from "../main/sign-in/SignInConfig";
import LandingConfig from "../main/landing/landingConfig";
import HomeConfig from "../main/home/homeConfig";
import CpdConfig from "../main/cpd/cpdConfig";
import LearnerOverviewConfig from "../main/learnerOverview/learnerOverviewConfig";
import ResourcesConfig from "../main/resources/resourcesConfig";
import ForumConfig from "../main/forum/forumConfig";
import CalendarConfig from "../main/calendar/calendarConfig";
import SupportConfig from "../main/support/supportConfig";
import ProposeYourInnovationsConfig from "../main/proposeYourInnovations/proposeYourInnovationsConfig";
import SkillsScanConfig from "../main/skillsScan/skillsScanConfig";
import CreateAssignmentConfig from "../main/createAssignment/createAssignmentConfig";
import PortfolioConfig from "../main/portfolio/portfolioConfig";
import LearnerPortfolioConfig from "../main/learnerPortfolio/learnerPortfolioConfig";
import AdminConfig from "../main/admin/adminConfig";
import CourseBuilderConfig from "../main/courseBuilder/courseBuilderConfig";
import FormsConfig from "../main/forms/formsConfig";
import CommunicationsConfig from "../main/communications/communicationsConfig";
import ForgotConfig from "../main/forgotPassword/forgotConfig";
import MyProfileConfig from "../main/myProfile/myProfileConfig";
import NotificationConfig from "../main/notification/notificationConfig";
import TimeLogConfig from "../main/timeLog/timeLogConfig";
import BroadcastConfig from "../main/broadcast/broadcastConfig";

const routeConfigs = [
    LandingConfig,
    SignInConfig,
    HomeConfig,
    CpdConfig,
    LearnerOverviewConfig,
    ResourcesConfig,
    ForumConfig,
    CalendarConfig,
    SupportConfig,
    ProposeYourInnovationsConfig,
    SkillsScanConfig,
    CreateAssignmentConfig,
    PortfolioConfig,
    LearnerPortfolioConfig,
    AdminConfig,
    CourseBuilderConfig,
    FormsConfig,
    CommunicationsConfig,
    ForgotConfig,
    MyProfileConfig,
    NotificationConfig,
    TimeLogConfig,
    BroadcastConfig
];

const routes = [
    ...FuseUtils.generateRoutesFromConfigs(
        routeConfigs,
        settingsConfig.defaultAuth
    ),
    {
        path: "*",
        element: < Navigate to="/" />,
    }
];

export default routes;