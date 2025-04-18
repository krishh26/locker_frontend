import FuseLoading from '@fuse/core/FuseLoading'
import { Autocomplete, Checkbox, FormControl, FormControlLabel, FormLabel, Grid, Pagination, Radio, RadioGroup, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { SecondaryButton } from 'src/app/component/Buttons'
import { useSelector } from 'react-redux';
import { getLearnerCourseDetails, selectLearnerManagement } from 'app/store/learnerManagement';
import { useDispatch } from 'react-redux';
import { selectGlobalUser } from 'app/store/globalUser';

const TNAUnits = (props) => {

    const { handleTabChange } = props
    const { learner, courseData, dataFetchLoading } = useSelector(selectLearnerManagement);
    const selectedUser = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectGlobalUser)?.selectedUser;

    const dispatch: any = useDispatch();

    const getCouseDetails = (value) => {

        const { course_id } = value.course
        const learner_id = selectedUser?.learner_id

        console.log(course_id, learner_id)
        dispatch(getLearnerCourseDetails({ course_id, learner_id }))
    }


    console.log("123456", courseData.units)
    return (
        <Grid>
            <Grid className="m-10 px-10 pt-10 ">
                <Grid className="m-10 flex gap-10">
                    <Typography className='h1 '>Choose TNA Course</Typography>
                    <Autocomplete
                        disablePortal
                        options={learner?.course}
                        getOptionLabel={(option: any) => option.course?.course_name}
                        sx={{ width: 300, marginLeft: 5 }}
                        renderInput={(params) => <TextField {...params} placeholder='Select Course' size='small'
                        />}
                        onChange={(event, value) => getCouseDetails(value)}
                    />
                </Grid>
            </Grid>
            {/* <Grid className="mx-10 px-10 ">
                <FormControl className='flex-row items-center gap-96'>
                    <FormLabel component="legend">Order By</FormLabel>
                    <RadioGroup
                        aria-label="options"
                        defaultValue="outlined"
                        name="radio-buttons-group"
                        className='flex-row'
                    // orientation="vertical"
                    >
                        <FormControlLabel
                            value="Unit Number"
                            control={<Radio />}
                            label="Unit Number"
                        // onChange={handleRadioChange}
                        />
                        <FormControlLabel
                            value="Group"
                            control={<Radio />}
                            label="Group"
                        // onChange={handleRadioChange}
                        />
                    </RadioGroup>
                </FormControl>
            </Grid> */}
            <Grid className="m-10 px-10 pt-10 ">
                <TableContainer sx={{ maxHeight: "auto" }} >
                    {dataFetchLoading ? (
                        <FuseLoading />
                    ) : courseData?.units?.length ?
                        <>
                            <Table
                                sx={{ minWidth: 650, heighFaddt: "100%" }}
                                size="small"
                                aria-label="simple table"
                            >
                                <TableHead className="bg-[#F8F8F8]">
                                    <TableRow>
                                        <TableCell align="left">Standard Units</TableCell>
                                        <TableCell align="left">Hours</TableCell>
                                        <TableCell align="left">Points/Credits</TableCell>
                                        <TableCell align="left">Level</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {courseData?.units?.map((row) => (
                                        <TableRow
                                            key={row.group}
                                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                        >
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8", width: "50%" }}
                                            >
                                                {row.title}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8", width: "10%" }}
                                            >
                                                {row?.glh}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8", width: "10%" }}
                                            >
                                                {row.credit_value}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8", width: "10%" }}
                                            >
                                                {row.level}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Grid className="flex justify-center items-center w-full my-12">
                                <SecondaryButton name="Next" onClick={() => handleTabChange("", 1)} />
                            </Grid>
                        </>
                        : <>
                            <h2>No units Found...!</h2>
                        </>}
                </TableContainer>
            </Grid>
        </Grid>
    )
}

export default TNAUnits