import { selectCourseManagement } from 'app/store/courseManagement';
import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, Typography, Grid, Avatar } from '@mui/material';
import dayjs from 'dayjs';

const UserCard = ({ user }) => {
    return (
        <Card className="shadow-lg border rounded-lg bg-white">
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Avatar
                            src={user.avatar?.url || '/default-avatar.png'}
                            alt={`${user.first_name} ${user.last_name}`}
                            sx={{ width: 56, height: 56 }}
                        />
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h6" className="font-bold text-gray-800">
                            {user.role.join() === "Employer" ? user?.employer?.employer_name : user.first_name + " " + user.last_name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Email: {user.email}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Mobile: {user.mobile}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Role: {user.role.join(', ')}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};


function getUniqueUserData(singleData) {

    // Extract user IDs
    const ids = [
        { ...singleData.EQA_id, role: "EQA" },
        { ...singleData.IQA_id, role: "IQA" },
        { ...singleData.LIQA_id, role: "LIQA" },
        { ...singleData.employer_id, role: "Employer" },
        { ...singleData.trainer_id, role: "Trainer" }
    ]

    return Object.values(ids.reduce((acc, user) => {

        const userId = user.user_id;
        if (userId === undefined) {
            return acc;
        }
        if (acc[userId]) {
            acc[userId] = { ...user, role: [...acc[userId].role, user.role] };
        } else {
            acc[userId] = { ...user, role: [user.role] };
        }
        return acc;
    }, {}));

}


const CourseData = () => {
    const { singleData } = useSelector(selectCourseManagement);
    const course = singleData?.course;

    const formatDate = (dateString) => {
        return dayjs(dateString).format('D MMMM YYYY');
    };

    return (
        <div className="container mx-auto p-4">
            <Typography variant="h5" className="font-bold mb-8 text-blue-700">
                Course Details
            </Typography>

            <Grid container spacing={4}>
                {/* Card 1 */}
                <Grid item xs={12} md={6}>
                    <Card className="shadow-lg h-full border-l-4 border-blue-500 bg-blue-50">
                        <CardContent>
                            <Typography variant="h5" className="font-bold text-blue-700 mb-4">
                                {course?.course_name}
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Course Code: <strong className="text-blue-700">{course?.course_code}</strong>
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Level: <strong className="text-blue-700">{course?.level}</strong>
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Sector: <strong className="text-blue-700">{course?.sector}</strong>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 2 */}
                <Grid item xs={12} md={6}>
                    <Card className="shadow-lg h-full border-l-4 border-green-500 bg-green-50">
                        <CardContent>
                            <Typography variant="h5" className="font-bold text-green-700 mb-4">
                                Course Information
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Qualification Type: <strong className="text-green-700">{course?.qualification_type}</strong>
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Recommended Minimum Age: <strong className="text-green-700">{course?.recommended_minimum_age}</strong>
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Total Credits: <strong className="text-green-700">{course?.total_credits}</strong>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 3 */}
                <Grid item xs={12} md={6}>
                    <Card className="shadow-lg h-full border-l-4 border-yellow-500 bg-yellow-50">
                        <CardContent>
                            <Typography variant="h5" className="font-bold text-yellow-700 mb-4">
                                Key Dates
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Operational Start Date: <strong className="text-yellow-700">{formatDate(course?.operational_start_date)}</strong>
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Guided Learning Hours: <strong className="text-yellow-700">{course?.guided_learning_hours}</strong>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 4 */}
                <Grid item xs={12} md={6}>
                    <Card className="shadow-lg h-full border-l-4 border-purple-500 bg-purple-50">
                        <CardContent>
                            <Typography variant="h5" className="font-bold text-purple-700 mb-4">
                                Additional Information
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Brand Guidelines: <strong className="text-purple-700">{course?.brand_guidelines}</strong>
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Qualification Status: <strong className="text-purple-700">{course?.qualification_status}</strong>
                            </Typography>
                            <Typography variant="body1" className="text-gray-700 mb-2">
                                Overall Grading Type: <strong className="text-purple-700">{course?.overall_grading_type}</strong>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h5" className="font-bold mt-24 mb-4 text-blue-700">
                Learner Supervisors
            </Typography>

            <Grid container spacing={4}>
                {getUniqueUserData(singleData)?.map((user: any) => (
                    <Grid item xs={12} sm={6} md={4} key={user.user_id}>
                        <UserCard user={user} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default CourseData;
