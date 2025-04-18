import i18next from 'i18next';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';
import { UserRole } from 'src/enum';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('tr', 'navigation', tr);
i18next.addResourceBundle('ar', 'navigation', ar);

const navigationConfig = [{
    id: 'dashboards.home',
    title: 'Home',
    type: 'item',
    icon: 'heroicons-outline:home',
    url: '/home',
    visible: [
        UserRole.Admin,
        UserRole.Trainer,
        UserRole.Employer,
        UserRole.IQA,
        UserRole.EQA,
        UserRole.LIQA,
    ],
},
{
    id: 'dashboards.portfolio',
    title: 'Portfolio',
    type: 'item',
    icon: 'heroicons-outline:user-circle',
    url: '/portfolio',
    visible: [UserRole.Learner],
},
{
    id: 'dashboards.cpd',
    title: 'CPD',
    type: 'item',
    icon: 'heroicons-outline:academic-cap',
    url: '/cpd',
    visible: [UserRole.Trainer, UserRole.Learner, UserRole.IQA, UserRole.LIQA],
},
{
    id: 'dashboards.learnerOverview',
    title: 'Learner Overview',
    type: 'item',
    icon: 'heroicons-outline:chart-pie',
    url: '/learnerOverview',
    visible: [UserRole.Trainer, UserRole.Employer],
},
{
    id: 'dashboards.resources',
    title: 'Resources',
    type: 'item',
    icon: 'heroicons-outline:library',
    url: '/resources',
    visible: [UserRole.Trainer, UserRole.Employer, UserRole.IQA, UserRole.LIQA],
},
{
    id: 'dashboards.forum',
    title: 'Forum',
    type: 'item',
    icon: 'heroicons-outline:users',
    url: '/forum',
    visible: [UserRole.Trainer, UserRole.Learner, UserRole.Employer, UserRole.IQA, UserRole.Admin, UserRole.LIQA],
},
{
    id: 'dashboards.calendar',
    title: 'Calendar',
    type: 'item',
    icon: 'heroicons-outline:calendar',
    url: '/calendar',
    visible: [UserRole.Admin, UserRole.Trainer, UserRole.Employer, UserRole.IQA, UserRole.LIQA],
},
{
    id: 'dashboards.skillsScan',
    title: 'Skills Scan',
    type: 'item',
    icon: 'heroicons-outline:qrcode',
    url: '/skillsScan',
    visible: [UserRole.Learner],
},
{
    id: 'dashboards.createAssignment',
    title: 'Assignment',
    type: 'item',
    icon: 'heroicons-outline:pencil-alt',
    url: '/createAssignment',
    visible: [UserRole.Learner],
},
{
    id: 'dashboards.learnerPortfolio',
    title: 'Learner Portfolio',
    type: 'item',
    icon: 'material-outline:folder_shared',
    url: '/learnerPortfolio',
    visible: [UserRole.IQA],
},
{
    id: 'dashboards.admin',
    title: 'Admin',
    type: 'item',
    icon: 'material-outline:admin_panel_settings',
    url: '/admin',
    visible: [UserRole.Admin],
},
{
    id: 'dashboards.courseBuilder',
    title: 'Course Builder',
    type: 'item',
    icon: 'material-outline:auto_stories',
    url: '/courseBuilder',
    visible: [UserRole.Admin],
},
{
    id: 'dashboards.forms',
    title: 'Forms',
    type: 'item',
    icon: 'material-outline:feed',
    url: '/forms',
    visible: [UserRole.Trainer, UserRole.Learner, UserRole.Employer, UserRole.IQA, UserRole.EQA, UserRole.Admin, UserRole.LIQA],
},
{
    id: 'dashboards.proposeYourInnovations',
    title: 'Propose Your Innovations',
    type: 'item',
    icon: 'feather:target',
    url: '/proposeYourInnovations',
    visible: [UserRole.Trainer, UserRole.Learner, UserRole.Employer, UserRole.IQA, UserRole.EQA, UserRole.Admin, UserRole.LIQA],
},
{
    id: 'dashboards.support',
    title: 'Support',
    type: 'item',
    icon: 'heroicons-outline:hand',
    url: '/support',
    visible: [UserRole.Trainer, UserRole.Learner, UserRole.Employer, UserRole.IQA, UserRole.EQA, UserRole.Admin, UserRole.LIQA],
}
];
export default navigationConfig;