import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import LearnerDetails from './learnerDeatils';
import { Button } from '@mui/material';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { slice as globalSlice, selectGlobalUser, tokenGetFetch } from "app/store/globalUser";
import { useDispatch } from 'react-redux';
import ContractedWorkHours from './contractedWork';
import { selectUser } from 'app/store/userSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CourseTab from './courseTab';
import LearnerPortfolio from './learnerPortfolio';

const CustomTab = styled(Tab)(({ theme }) => ({
    textTransform: 'none', // Disable uppercase
    border: '1px solid #ccc', // Default border for all tabs
    borderRadius: '4px', // Rounded corners for each tab
    color: '#5F452A', // Color for inactive tabs
    '&.Mui-selected': {
        backgroundColor: 'var(--primaryColor)', // Background for active tab
        color: '#ffffff', // Text color for active tab
    },
    '&:hover': {
        borderColor: 'var(--primaryColor)', // Hover state border color
    },
    minHeight: "1rem",
    padding: "1rem"
}));


const CustomTabs = styled(Tabs)({
    '& .MuiTabs-indicator': {
        display: 'none', // Hide default indicator
    },
});

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function NewPortfolio() {
    const [value, setValue] = React.useState(0);
    const { learnerTab, selectedUser } = useSelector(selectGlobalUser);
    const dispatch: any = useDispatch();
    const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

    const role = user?.role;

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleLearnerTab = async () => {
        if (learnerTab.tab && !learnerTab.tab.closed) {
            learnerTab.tab.close();
        }

        const data = await dispatch(tokenGetFetch(selectedUser.email))
        const newTab = window.open('/portfolio', '_blank');
        newTab.sessionStorage.setItem('learnerToken', JSON.stringify({ ...data, user: { ...data.user, displayName: data.user.first_name + " " + data.user.last_name } }));
        newTab.onload = async () => {
            if (data) {
                newTab.focus();
            }
        };

        dispatch(globalSlice.setLearnerTab({ ...learnerTab, tab: newTab }));

    }

    if (role === "Learner") {
        return (
            <>
                {/* <Portfolio /> */}
                <LearnerPortfolio />
            </>
        );
    }

    return (<>
        {/* <Portfolio /> */}
        <div className='p-10 overflow-y-auto'>
            <div className='flex justify-between items-center'>
                <h1>{selectedUser.first_name + " " + selectedUser.last_name}</h1>
                <Button onClick={handleLearnerTab} className='bg-[#007E84] hover:bg-[#007E84] text-white rounded-4'><ArrowBackIcon className='text-xl mr-4' /> Learner Dashboard</Button>
            </div>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <CustomTabs value={value} onChange={handleChange} aria-label="customized tabs example"
                        sx={{
                            ".muiltr-heg063-MuiTabs-flexContainer": { gap: "0.5rem" }
                        }}>
                        <CustomTab label="Profile" {...a11yProps(0)} />
                        <CustomTab label="Course" {...a11yProps(1)} />
                        <CustomTab label="Contracted Work Hours" {...a11yProps(2)} />
                    </CustomTabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <LearnerDetails />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <CourseTab />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <ContractedWorkHours />
                </CustomTabPanel>
                {/*<CustomTabPanel value={value} index={2}>
                    Action
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                    Test and Exams
                </CustomTabPanel>
                <CustomTabPanel value={value} index={4}>
                    Contact Diary
                </CustomTabPanel>
                <CustomTabPanel value={value} index={5}>
                    ALS
                </CustomTabPanel> */}
            </Box>
        </div>
    </>

    );
}