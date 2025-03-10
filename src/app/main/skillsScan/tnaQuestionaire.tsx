import { Card, CardContent, Checkbox, Grid, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { selectLearnerManagement } from "app/store/learnerManagement";
import { selectSkillsScan, slice, updateCourseUnitSkillAPI } from "app/store/skillsScan";
import { slice as courseSlice } from "app/store/learnerManagement";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { SecondaryButton } from "src/app/component/Buttons";

const TNAQuestionaire = (props) => {

    const { handleTabChange } = props;
    const { singleData } = useSelector(selectSkillsScan);
    const { courseData } = useSelector(selectLearnerManagement);


    const dispatch: any = useDispatch();

    const [sampleData, setSampleData] = useState(courseData?.units || []);
    const [highlightBlanks, setHighlightBlanks] = useState(false);

    const handleClick = (event, row) => {
        dispatch(slice.setSingleData(row));
    };

    const radioHandler = (id, value) => {
        const data = JSON.parse(JSON.stringify(singleData));
        const updatedData = data?.subUnit?.find(item => item?.id === id)
        updatedData.rating = value
        dispatch(slice.setSingleData(data));
        const updatedCourse = JSON.parse(JSON.stringify(courseData))
        const unitUpdate = updatedCourse.units.find(item => item.id === singleData.id)
        unitUpdate.subUnit = unitUpdate?.subUnit?.map(item => item.id === id ? updatedData : item)
        dispatch(courseSlice.setCourseData({ course: updatedCourse }))
        setSampleData(updatedCourse?.units)
    }

    const saveData = () => {
        dispatch(updateCourseUnitSkillAPI(courseData))
    }

    const handleHighlightBlanksChange = (event) => {
        setHighlightBlanks(event.target.checked);
    };

    return (
        <Grid>
            <Grid className="flex items-center pl-28">
                <Checkbox
                    checked={highlightBlanks}
                    onChange={handleHighlightBlanksChange}
                    name="highlightBlanks"
                    color="primary"
                />
                <Typography>
                    Highlight Blanks
                </Typography>
            </Grid>
            <Grid className="w-full flex" >
                <Grid className="w-1/4 p-20">
                    {sampleData?.map((row, index) => (
                        <Card
                            variant="outlined"
                            className="rounded-0 hover:bg-grey-100 cursor-pointer"
                            elevation={0}
                            onClick={(e) => handleClick(e, row)}
                        >
                            <CardContent style={singleData?.id === row.id ? { background: "lightgray" } : {}}>
                                <Typography className="text-12">{index + 1}. {row.title}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Grid>
                <Grid className="w-full border-grey-600 border-2 h-fit my-20">
                    <Card
                        variant="outlined"
                        className="rounded-0 bg-grey-200 border-b-grey-600 border-b-2 "
                        elevation={0}
                    >
                        <CardContent>
                            <Typography className="font-500 text-center">{singleData.standardUnits}</Typography>
                        </CardContent>
                    </Card>
                    <Grid className="flex">
                        <Grid className="flex justify-center items-center w-full my-12 border-grey-600 border-2 ml-[30%] gap-20 p-20">
                            <Typography className="text-15">☹️ - Not sure</Typography>
                            <Typography className="text-15">😖 - Never</Typography>
                            <Typography className="text-15">🙂 - Sometimes</Typography>
                            <Typography className="text-15">😁 - Always</Typography>
                        </Grid>
                    </Grid>
                    <TableContainer sx={{ maxHeight: "auto" }} >
                        <Table
                            sx={{ minWidth: 650, heighFaddt: "100%" }}
                            size="small"
                            aria-label="simple table"
                        >
                            <TableHead className="bg-grey-300 ">
                                <TableRow >
                                    <TableCell >Topic</TableCell>
                                    <TableCell align="left">Skill To Be Demonstrated</TableCell>
                                    <TableCell align="center">☹️</TableCell>
                                    <TableCell align="center">😖</TableCell>
                                    <TableCell align="center">🙂</TableCell>
                                    <TableCell align="center">😁</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {singleData?.subUnit?.map((row, index) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                    >
                                        <TableCell
                                            component="th"
                                            scope="row"
                                            sx={{ borderBottom: "2px solid #F8F8F8", width: "26%" }}
                                        >
                                            {index === 0 ?
                                                singleData?.title : null}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{ borderBottom: "2px solid #F8F8F8", width: "70%" }}
                                        >
                                            {row.subTitle}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                borderBottom: "2px solid #F8F8F8", width: "1%",
                                                backgroundColor: highlightBlanks && row.rating == null ? 'yellow' : 'inherit'
                                            }}
                                        >
                                            <Radio checked={row?.rating === 1} onClick={() => radioHandler(row.id, 1)} />
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                borderBottom: "2px solid #F8F8F8", width: "1%",
                                                backgroundColor: highlightBlanks && row.rating == null ? 'yellow' : 'inherit'
                                            }}
                                        >
                                            <Radio checked={row?.rating === 2} onClick={() => radioHandler(row.id, 2)} />
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                borderBottom: "2px solid #F8F8F8", width: "1%",
                                                backgroundColor: highlightBlanks && row.rating == null ? 'yellow' : 'inherit'
                                            }}
                                        >
                                            <Radio checked={row?.rating === 3} onClick={() => radioHandler(row.id, 3)} />
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                borderBottom: "2px solid #F8F8F8", width: "1%",
                                                backgroundColor: highlightBlanks && row.rating == null ? 'yellow' : 'inherit'
                                            }}
                                        >
                                            <Radio checked={row?.rating === 4} onClick={() => radioHandler(row.id, 4)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Grid className="flex justify-end items-end my-20 mr-24 gap-10">
                        <Grid>
                            <SecondaryButton name="Save" onClick={saveData} />
                        </Grid>
                        <Grid>
                            <SecondaryButton name="Next" onClick={() => handleTabChange("", 2)} />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default TNAQuestionaire