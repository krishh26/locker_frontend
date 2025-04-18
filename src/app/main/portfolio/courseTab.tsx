import FuseLoading from '@fuse/core/FuseLoading';
import { Autocomplete, Box, Dialog, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { courseAllocationAPI, selectCourseManagement } from 'app/store/courseManagement';
import { selectGlobalUser } from 'app/store/globalUser';
import { getLearnerDetails, getLearnerDetailsReturn, selectLearnerManagement } from 'app/store/learnerManagement';
import { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { LoadingButton, SecondaryButton, SecondaryButtonOutlined } from 'src/app/component/Buttons';
import DataNotFound from 'src/app/component/Pages/dataNotFound';
import { slice as globalSlice } from "app/store/globalUser";
import { selectUser } from 'app/store/userSlice';

const CourseTab = () => {

    const dispatch: any = useDispatch();

    const { data } = useSelector(selectCourseManagement);
    const { LIQA, IQA, trainer, employer, EQA, learner } = useSelector(selectLearnerManagement);
    const learnerUser = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectGlobalUser)?.selectedUser;

    const [courseDialog, setCourseDialog] = useState(false);
    const [courseAllocationData, setCourseAllocationData] = useState({
        course_id: "",
        trainer_id: "",
        IQA_id: "",
        learner_id: learner?.learner_id,
        EQA_id: "",
        LIQA_id: "",
        employer_id: "",
        start_date: "",
        end_date: ""
    });
    const [loading, setLoading] = useState(false);

    const handleUpdateData = (name, value) => {
        setCourseAllocationData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const closeCourseDialog = () => {
        setCourseDialog(false);
    };
    console.log(learnerUser, "user")

    const handleLearnerRefetch = async () => {
        const data = await dispatch(getLearnerDetails(learnerUser?.learner_id))
        if (data) {
            dispatch(globalSlice.setSelectedUser(data))
        }
    }

    const courseAllocation = async () => {
        setLoading(true);
        const response = await dispatch(
            courseAllocationAPI(courseAllocationData)
        );
        if (response) {
            setCourseAllocationData({
                course_id: "",
                trainer_id: "",
                IQA_id: "",
                learner_id: learner?.learner_id,
                EQA_id: "",
                LIQA_id: "",
                employer_id: "",
                start_date: "",
                end_date: ""
            });
        }
        setLoading(false);
        setCourseDialog(false);
        handleLearnerRefetch()
    };

    const { selectedUser, dataFetchLoading } = useSelector(selectGlobalUser);

    const handleCreateCourse = () => {
        setCourseDialog(true);
        // navigate("/courseBuilder/course");
    };

    const formatDate = (date) => {
        if (!date) return "";
        const formattedDate = date.substr(0, 10);
        return formattedDate;
    };

    return (
        <>
            <div>
                <div>
                    <h1 className='font-semibold'>Learner Course Management</h1>
                </div>

                <Grid className='w-full flex flex-row gap-20 mt-32 mb-24 justify-end'>
                    <SecondaryButton
                        className="py-6"
                        name="Add Course"
                        onClick={handleCreateCourse}
                    />
                </Grid>

                <TableContainer sx={{ minHeight: 550, display: "flex", flexDirection: "column", justifyContent: "space-between", overflowX: "auto !important" }}>
                    {dataFetchLoading ? (
                        <FuseLoading />
                    ) : selectedUser?.course?.length ? (
                        <Table
                            sx={{ minWidth: 650, height: "100%" }}
                            size="small"
                            aria-label="simple table"
                        >
                            <TableHead className="bg-[#F8F8F8]">
                                <TableRow>
                                    <TableCell align="left">
                                        Course Name
                                    </TableCell>
                                    <TableCell align="left">
                                        Status
                                    </TableCell>
                                    <TableCell align="left">
                                        Episode
                                    </TableCell>
                                    <TableCell align="left">
                                        Grouping
                                    </TableCell>
                                    <TableCell align="left">
                                        Qualification Code
                                    </TableCell>
                                    <TableCell align="left">
                                        Course Start/End
                                    </TableCell>
                                    <TableCell align="left">
                                        Extension Date
                                    </TableCell>
                                    <TableCell align="left">
                                        Actual End Date
                                    </TableCell>
                                    <TableCell align="left">
                                        Trainer(s)
                                    </TableCell>
                                    <TableCell align="left">
                                        IQA(s)
                                    </TableCell>
                                    <TableCell align="left">
                                        Grades
                                    </TableCell>
                                    <TableCell align="left">
                                        Awarding Body
                                    </TableCell>
                                    <TableCell align="left">
                                        Registratin Details
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedUser?.course?.map((row) => (
                                    <TableRow
                                        key={row?.course?.user_course_id}
                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                    >
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                            {row?.course?.course_name}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                            {row?.course?.qualification_status}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                            {formatDate(row?.course.operational_start_date)}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                            {row?.trainer_id?.first_name} {row?.trainer_id?.last_name}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                            {row?.IQA_id?.first_name} {row?.IQA_id?.last_name}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", minWidth: "15rem" }}
                                        >
                                            {/* {formatDate(row.created_at)} */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div
                            className="flex flex-col justify-center items-center gap-10 "
                            style={{ height: "94%" }}
                        >
                            <DataNotFound width="25%" />
                            <Typography variant="h5">No data found</Typography>
                            <Typography variant="body2" className="text-center">
                                It is a long established fact that a reader will be <br />
                                distracted by the readable content.
                            </Typography>
                        </div>
                    )}
                    {/* <CustomPagination
                    pages={meta_data?.pages}
                    page={meta_data?.page}
                    handleChangePage={handleChangePage}
                    items={meta_data?.items}
                /> */}
                </TableContainer>
            </div>

            <Dialog
                open={courseDialog}
                onClose={closeCourseDialog}
                sx={{
                    ".MuiDialog-paper": {
                        borderRadius: "4px",
                        padding: "1rem",
                        width: "440px",
                    },
                }}
            >
                <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                    <div className="w-full">
                        <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                            Select Course
                        </Typography>
                        <Autocomplete
                            disableClearable
                            fullWidth
                            size="small"
                            options={data}
                            getOptionLabel={(option: any) => option.course_name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select Course"
                                    name="role"
                                    value={courseAllocationData?.course_id}
                                />
                            )}
                            onChange={(e, value: any) =>
                                handleUpdateData("course_id", value.course_id)
                            }
                            sx={{
                                ".MuiAutocomplete-clearIndicator": {
                                    color: "#5B718F",
                                },
                            }}
                            PaperComponent={({ children }) => (
                                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
                            )}
                        />
                    </div>
                </Box>
                <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                    <div className="w-full">
                        <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                            Trainer
                        </Typography>
                        <Autocomplete
                            disableClearable
                            fullWidth
                            size="small"
                            options={trainer}
                            getOptionLabel={(option: any) => option.user_name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select Trainer"
                                    name="role"
                                    value={courseAllocationData?.trainer_id}
                                />
                            )}
                            onChange={(e, value: any) =>
                                handleUpdateData("trainer_id", value.user_id)
                            }
                            sx={{
                                ".MuiAutocomplete-clearIndicator": {
                                    color: "#5B718F",
                                },
                            }}
                            PaperComponent={({ children }) => (
                                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
                            )}
                        />
                    </div>
                </Box>
                <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                    <div className="w-full">
                        <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                            IQA
                        </Typography>
                        <Autocomplete
                            disableClearable
                            fullWidth
                            size="small"
                            options={IQA}
                            getOptionLabel={(option: any) => option.user_name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select IQA"
                                    name="role"
                                    value={courseAllocationData?.IQA_id}
                                />
                            )}
                            onChange={(e, value: any) =>
                                handleUpdateData("IQA_id", value.user_id)
                            }
                            sx={{
                                ".MuiAutocomplete-clearIndicator": {
                                    color: "#5B718F",
                                },
                            }}
                            PaperComponent={({ children }) => (
                                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
                            )}
                        />
                    </div>
                </Box>
                <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                    <div className="w-full">
                        <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                            LIQA
                        </Typography>
                        <Autocomplete
                            disableClearable
                            fullWidth
                            size="small"
                            options={LIQA}
                            getOptionLabel={(option: any) => option.user_name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select LIQA"
                                    name="role"
                                    value={courseAllocationData?.LIQA_id}
                                />
                            )}
                            onChange={(e, value: any) =>
                                handleUpdateData("LIQA_id", value.user_id)
                            }
                            sx={{
                                ".MuiAutocomplete-clearIndicator": {
                                    color: "#5B718F",
                                },
                            }}
                            PaperComponent={({ children }) => (
                                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
                            )}
                        />
                    </div>
                </Box>
                <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                    <div className="w-full">
                        <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                            EQA
                        </Typography>
                        <Autocomplete
                            disableClearable
                            fullWidth
                            size="small"
                            options={EQA}
                            getOptionLabel={(option: any) => option.user_name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select EQA"
                                    name="role"
                                    value={courseAllocationData?.EQA_id}
                                />
                            )}
                            onChange={(e, value: any) =>
                                handleUpdateData("EQA_id", value.user_id)
                            }
                            sx={{
                                ".MuiAutocomplete-clearIndicator": {
                                    color: "#5B718F",
                                },
                            }}
                            PaperComponent={({ children }) => (
                                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
                            )}
                        />
                    </div>
                </Box>
                <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                    <div className="w-full">
                        <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                            Employer
                        </Typography>
                        <Autocomplete
                            disableClearable
                            fullWidth
                            size="small"
                            options={employer}
                            getOptionLabel={(option: any) => option.employer?.employer_name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select Employer"
                                    name="role"
                                    value={courseAllocationData?.employer_id}
                                />
                            )}
                            onChange={(e, value: any) =>
                                handleUpdateData("employer_id", value.user_id)
                            }
                            sx={{
                                ".MuiAutocomplete-clearIndicator": {
                                    color: "#5B718F",
                                },
                            }}
                            PaperComponent={({ children }) => (
                                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
                            )}
                        />
                    </div>
                </Box>
                <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                    <div className="w-full">
                        <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                            Start Date
                        </Typography>
                        <TextField
                            name="start_date"
                            value={courseAllocationData?.start_date}
                            size="small"
                            type='date'
                            required
                            fullWidth
                            onChange={(e) => setCourseAllocationData({
                                ...courseAllocationData,
                                start_date: e.target.value
                            })}
                        />

                    </div>
                </Box>
                <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                    <div className="w-full">
                        <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                            End Date
                        </Typography>
                        <TextField
                            name="end_date"
                            value={courseAllocationData?.end_date}
                            size="small"
                            type='date'
                            required
                            fullWidth
                            onChange={(e) => setCourseAllocationData({
                                ...courseAllocationData,
                                end_date: e.target.value
                            })}
                        />

                    </div>
                </Box>
                <div className="flex justify-end mt-4">
                    {loading ? (
                        <LoadingButton style={{ width: "10rem" }} />
                    ) : (
                        <>
                            <SecondaryButtonOutlined
                                name="Cancel"
                                style={{ width: "10rem", marginRight: "2rem" }}
                                onClick={closeCourseDialog}
                            />
                            <SecondaryButton
                                name="Add Course"
                                style={{ width: "10rem" }}
                                onClick={courseAllocation}
                            />
                        </>
                    )}
                </div>
            </Dialog>
        </>
    )
}

export default CourseTab