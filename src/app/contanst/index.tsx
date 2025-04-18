import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import DataUsageOutlinedIcon from "@mui/icons-material/DataUsageOutlined";
import AppsOutageOutlinedIcon from "@mui/icons-material/AppsOutageOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PortraitOutlinedIcon from "@mui/icons-material/PortraitOutlined";
import RemoveFromQueueOutlinedIcon from "@mui/icons-material/RemoveFromQueueOutlined";
import DomainVerificationOutlinedIcon from "@mui/icons-material/DomainVerificationOutlined";
import { UserRole } from "src/enum";

export const HomePageData = [
  {
    name: "30",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(155, 197, 61, 1)",
    radiusColor: "rgba(155, 197, 61, 0.1)",
    title: "Active learner",
    isIcon: false,
  },
  {
    name: "20",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(195, 66, 63, 1)",
    radiusColor: "rgba(195, 66, 63, 0.1)",
    title: "Learners on bil",
    isIcon: false,
  },
  {
    name: "10",
    color: "error",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(3, 181, 170, 1)",
    radiusColor: "rgba(3, 181, 170, 0.1)",
    title: "Overdue learners",
    isIcon: false,
  },
  {
    name: "10",
    color: "error",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(201, 100, 128, 1)",
    radiusColor: "rgba(201, 100, 128, 0.1)",
    title: "Overdue progress review",
    isIcon: false,
  },
  {
    name: "30",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(63, 102, 52, 1)",
    radiusColor: "rgba(63, 102, 52, 0.1)",
    title: "Learners due complete in next 30 days",
    isIcon: false,
  },
  {
    name: "10",
    color: "error",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(3, 181, 170, 1)",
    radiusColor: "rgba(3, 181, 170, 0.1)",
    title: "Learners off track",
    isIcon: false,
  },
  {
    name: "10",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(201, 100, 128, 1)",
    radiusColor: "rgba(201, 100, 128, 0.1)",
    title: "Unmapped evidences",
    isIcon: false,
  },
  {
    name: "10",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(63, 102, 52, 1)",
    radiusColor: "rgba(63, 102, 52, 0.1)",
    title: "Learners assigned by qual",
    isIcon: false,
  },
  {
    name: "10",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(195, 66, 63, 1)",
    radiusColor: "rgba(195, 66, 63, 0.1)",
    title: "Days to practical end date (Gateway)",
    isIcon: false,
  },
  {
    name: "10",
    color: "error",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(155, 197, 61, 1)",
    radiusColor: "rgba(155, 197, 61, 0.1)",
    title: "Overdue IQA action",
    isIcon: false,
  },
  {
    name: "10",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(201, 100, 128, 1)",
    radiusColor: "rgba(201, 100, 128, 0.1)",
    title: "Outstanding IQA actions",
    isIcon: false,
  },
  {
    name: "10",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(155, 197, 61, 1)",
    radiusColor: "rgba(155, 197, 61, 0.1)",
    title: "Due IQA action in next 30 days",
    isIcon: false,
  },
  {
    name: "20",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(3, 181, 170, 1)",
    radiusColor: "rgba(3, 181, 170, 0.1)",
    title: "Due session in next 7 days",
    isIcon: false,
  },
  {
    name: "20",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(201, 100, 128, 1)",
    radiusColor: "rgba(201, 100, 128, 0.1)",
    title: "Learner all a sampling plan",
    isIcon: false,
  },
  {
    name: "20",
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(63, 102, 52, 1)",
    radiusColor: "rgba(63, 102, 52, 0.1)",
    title: "Learner not all a sampling plan",
    isIcon: false,
  },
  {
    name: <AssessmentOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(3, 181, 170, 1)",
    radiusColor: "rgba(3, 181, 170, 0.1)",
    title: "Trainer rag report",
    isIcon: true,
  },
  {
    name: <BadgeOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(201, 100, 128, 1)",
    radiusColor: "rgba(201, 100, 128, 0.1)",
    title: "Outstanding EQA actions",
    isIcon: true,
  },
  {
    name: <AppsOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(63, 102, 52, 1)",
    radiusColor: "rgba(63, 102, 52, 0.1)",
    title: "Due activities",
    isIcon: true,
  },
  {
    name: <AppsOutageOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(195, 66, 63, 1)",
    radiusColor: "rgba(195, 66, 63, 0.1)",
    title: "Overdue activities",
    isIcon: true,
  },
  {
    name: <PendingActionsOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(155, 197, 61, 1)",
    radiusColor: "rgba(155, 197, 61, 0.1)",
    title: "Activities due in the next 7 days",
    isIcon: true,
  },
  {
    name: <PortraitOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(195, 66, 63, 1)",
    radiusColor: "rgba(195, 66, 63, 0.1)",
    title: "Due session",
    isIcon: true,
  },
  {
    name: <DomainVerificationOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(155, 197, 61, 1)",
    radiusColor: "rgba(155, 197, 61, 0.1)",
    title: "Sampling due",
    isIcon: true,
  },
  {
    name: <RemoveFromQueueOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(3, 181, 170, 1)",
    radiusColor: "rgba(3, 181, 170, 0.1)",
    title: "Sampling overdue",
    isIcon: true,
  },
  {
    name: <DataUsageOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(201, 100, 128, 1)",
    radiusColor: "rgba(201, 100, 128, 0.1)",
    title: "Overall progress",
    isIcon: true,
  },
  {
    name: <DateRangeOutlinedIcon />,
    color: "default",
    backgroundColor: "var(--pc1)",
    textColor: "rgba(63, 102, 52, 1)",
    radiusColor: "rgba(63, 102, 52, 0.1)",
    title: "OTJ up to date against expected",
    isIcon: true,
  },
];

export const AdminPageData = [
  {
    path: "/admin/user",
    name: "User Management",
    info: "Efficiently manage users with streamlined operations including add, delete, and update functionalities within the User Management tab.",
    svg: "assets/images/svgImage/usermanagement.svg",
  },
  {
    path: "/admin/learner",
    name: "Learner Management",
    info: "Optimize learner administration by seamlessly adding, updating, and deleting learners, while also facilitating the assignment of courses, trainers, employers, IQAs, and EQAs within the dedicated Learner Management tab.",
    svg: "assets/images/svgImage/learnermanagement.svg",
  },
  {
    path: "/admin/employer",
    name: "Employer Management",
    info: "Optimize learner administration by seamlessly adding, updating, and deleting learners, while also facilitating the assignment of courses, trainers, employers, IQAs, and EQAs within the dedicated Learner Management tab.",
    svg: "assets/images/svgImage/employermanagement.svg",
  },
];

export const AdminRedirect = {
  link: "/admin",
  name: "Admin",
};

export const EmployerRedirect = {
  link: "/admin/employer",
  name: "Employer",
};

export const AssignmentRedirect = {
  link: "/createAssignment",
  name: "Assignment",
};

export const userManagementTableColumn = [
  { id: "first_name", label: "Name", minWidth: 170, align: "left" },
  { id: "user_name", label: "Username", minWidth: 170, align: "left" },
  { id: "email", label: "Email", minWidth: 170, align: "left" },
  { id: "mobile", label: "Mobile", minWidth: 170, align: "left" },
  { id: "roles", label: "Roles", minWidth: 100, align: "left" },
  { id: "status", label: "Status", minWidth: 100, align: "left" },
  { id: "actions", label: "Actions", minWidth: 170, align: "center" },
];

export const learnerManagementTableColumn = [
  { id: "first_name", label: "Name", minWidth: 170, align: "left" },
  { id: "user_name", label: "Username", minWidth: 170, align: "left" },
  { id: "email", label: "Email", minWidth: 170, align: "left" },
  { id: "mobile", label: "Mobile", minWidth: 170, align: "left" },
  { id: "course", label: "Course", minWidth: 170, align: "left" },
  { id: "status", label: "Status", minWidth: 100, align: "left" },
  { id: "actions", label: "Actions", minWidth: 170, align: "center" },
];

export const employerManagementTableColumn = [
  { id: "employer_name", label: "Employer Name", minWidth: 170, align: "left" },
  { id: "business_department", label: "Bussiness Department", minWidth: 170, align: "left" },
  { id: "email", label: "Email", minWidth: 170, align: "left" },
  { id: "telephone", label: "Mobile", minWidth: 170, align: "left" },
  { id: "city", label: "City", minWidth: 100, align: "left" },
  { id: "country", label: "Country", minWidth: 100, align: "left" },
  { id: "postal_code", label: "Postal Code", minWidth: 100, align: "left" },
  { id: "actions", label: "Actions", minWidth: 170, align: "center" },
];

export const roles = [
  {
    value: UserRole.Admin,
    label: "Admin",
  },
  {
    value: UserRole.Trainer,
    label: "Trainer",
  },
  {
    value: UserRole.Employer,
    label: "Employer",
  },
  {
    value: UserRole.IQA,
    label: "IQA",
  },
  {
    value: UserRole.EQA,
    label: "EQA",
  },
  {
    value: UserRole.LIQA,
    label: "LIQA",
  },
];

export const courseManagementTableColumn = [
  { id: "course_name", label: "Course Name", minWidth: 200, align: "left" },
  { id: "course_code", label: "Code", minWidth: 70, align: "left" },
  { id: "level", label: "Level", minWidth: 170, align: "left" },
  { id: "sector", label: "Sector", minWidth: 170, align: "left" },
  {
    id: "guided_learning_hours",
    label: "Learning Hours",
    minWidth: 100,
    align: "left",
  },
  { id: "actions", label: "Actions", minWidth: 170, align: "center" },
];

export const courseManagementUnitColumn = [
  { id: "unit_ref", label: "Unint Ref", minWidth: 80, align: "left" },
  { id: "title", label: "Title", minWidth: 600, align: "left" },
  { id: "level", label: "Level", minWidth: 80, align: "left" },
  { id: "glh", label: "GLH", minWidth: 80, align: "left" },
  { id: "credit_value", label: "Credit Value", minWidth: 80, align: "left" },
  { id: "actions", label: "Action", minWidth: 80, align: "center" },
];

export const resourceManagementTableColumn = [
  { id: "name", label: "Name", minWidth: 180, align: "left" },
  { id: "description", label: "Description", minWidth: 240, align: "left" },
  { id: "glh", label: "GLH", minWidth: 80, align: "left" },
  { id: "job_type", label: "On/Off Job", minWidth: 80, align: "left" },
  { id: "resource_type", label: "Resource Type", minWidth: 80, align: "left" },
  { id: "actions", label: "Action", minWidth: 80, align: "center" },
];

export const portfolioCard = [
  { id: 1, name: "Upload Work", color: "#FCA14E" },
  { id: 2, name: "Unit and Gap Analysis", color: "#8F78F4" },
  { id: 3, name: "Actions and Activities", color: "#F44771" },
  { id: 4, name: "Resources", color: "#009FB7" },
  { id: 5, name: "Time Log", color: "#E95ACB" },
  { id: 6, name: "Skill Scan", color: "#489E20" }
];

// export const portfolioCard = [
//   { id: 1, name: "Upload Work", color: "#FCA14E" },
//   { id: 2, name: "Unit and Gap Analysis", color: "#8F78F4" },
// { id: 3, name: "Gap Analysis", color: "#F44771" },
//   { id: 4, name: "Actions and Activities", color: "#009FB7" },
// { id: 5, name: "Health and Wellbeing", color: "#E95ACB" },
// { id: 6, name: "Choose Units", color: "#489E20" },
// { id: 7, name: "Learning Plan", color: "#1E72AE" },
//   { id: 8, name: "Resources", color: "#A847F4" },
//   { id: 9, name: "Time Log", color: "#B7B000" },
// { id: 10, name: "Supplementary Training", color: "#4564D0" },
// ];

export const fundingBodyData = [
  "Advance Learning Loan",
  "Bursary",
  "Commercial",
  "Community Learning",
  "EFA",
  "Employer",
  "ESF",
  "ESFA",
  "Fee Waiver",
  "FWDF",
  "ITA",
  "Levy",
  "MA Fully Funded",
  "MA-Employer",
  "Non-Levy",
  "Other",
  "SAAS",
  "SAAS-Employer",
  "SAAS-Self",
  "SDS",
  "Self",
  "SFA",
  "Student Loan",
];
