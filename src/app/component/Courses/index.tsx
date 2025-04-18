import {
  Autocomplete,
  Box,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  createCourseAPI,
  selectCourseManagement,
  updateCourseAPI,
} from "app/store/courseManagement";
import { useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import Style from "./style.module.css";
import { Virtuoso } from 'react-virtuoso';

const generateUnitObject = (unitDataArray = []) => {
  const unitObject = {};
  unitDataArray.forEach((units, index) => {
    const { course_details, unit_details } = units;
    unitObject[course_details?.course_code] = {
      id: course_details?.course_code,
      unit_ref: course_details?.course_code || "",
      title: course_details?.Title || "",
      mandatory: course_details?.mandatory,
      // subTitle: course_details.subTitle || "",
      level: course_details?.Level || 0,
      glh: course_details?.["Guided learning hours"] ?? 0,
      credit_value: course_details?.Credit || 0,
      subUnit: unit_details?.map((value, index) => {
        const [subTitle, units]: any = Object.values(value);
        const subUnit = units?.map((value, idx) => ({ id: Math.random() * 100000, description: `${index + 1}.${idx + 1} ${value.text}` }))
        return ({
          id: Math.random() * 100000,
          subTitle: `${index + 1}. ${subTitle}`,
          subTopic: subUnit
        })
      }) || [],
    };
  });
  return unitObject;
};

function formatText(text = "") {
  let formattedText = text.replace(/\n/g, " ");
  return formattedText;
}

const inputStyle = {
  borderRadius: 0,
  // borderBottom: '1px solid lightgray',
  padding: "1rem",
};

const row = (mandatoryUnit, setUnitData, edit, removeUnitHandler, addSubUnitHandler, setSubUnitData, removeSubUnitHandler, setSubTopicData, removeSubTopicHandler, addTopicHandler): any => {
  console.log(mandatoryUnit)
  const Units = Object.keys(mandatoryUnit).map((key) => {
    return {
      ...mandatoryUnit[key],
    };
  });

  console.log(Units)
  return <Virtuoso
    style={{
      minHeight: '3000px',
      // background: '#f8f8f8'
      // border: "1px solid red"
    }}
    totalCount={Units?.length}
    itemContent={index => {
      const item = Units[index];
      return <div>
        <div className="w-full flex gap-24 items-center ">
          <TextField
            size="small"
            type="text"
            value={item?.unit_ref}
            name="unit_ref"
            placeholder={`Enter a Unint Ref`}
            onChange={(e) => setUnitData(item?.id, e.target)}
            className=" w-1/3"
            style={inputStyle}
            disabled={edit === "view"}
          />
          <TextField
            size="small"
            type="text"
            value={item?.title}
            name="title"
            placeholder={`Enter a title`}
            onChange={(e) => setUnitData(item?.id, e.target)}
            className="w-2/3"
            style={inputStyle}
            disabled={edit === "view"}
          />
          <FormControl variant="standard" className="w-1/5">
            <Select
              labelId={`select-label-${item?.id}`}
              value={item?.mandatory}
              onChange={(e) =>
                setUnitData(item?.id, {
                  name: "mandatory",
                  value: e.target.value,
                })
              }
              disabled={edit === "view"}
            >
              <MenuItem value={"true"}>Mandatory Unit</MenuItem>
              <MenuItem value={"false"}>Optional Unit</MenuItem>
            </Select>
          </FormControl>
          <Box className="flex items-center justify-between">
            {edit !== "view" && (
              <Tooltip title="Remove unit">
                <CloseIcon
                  className="cursor-pointer"
                  onClick={() => removeUnitHandler(item?.id)}
                />
              </Tooltip>
            )}
          </Box>
        </div>
        <div className="w-full flex gap-24 items-center ">
          <TextField
            size="small"
            type="number"
            className="w-1/3"
            value={item?.level}
            name="level"
            placeholder={`Enter a Level`}
            onChange={(e) => setUnitData(item?.id, e.target)}
            style={inputStyle}
            disabled={edit === "view"}
          />

          <TextField
            size="small"
            type="number"
            className="w-1/3"
            value={item?.credit_value}
            name="credit_value"
            placeholder={`Enter a credit value`}
            onChange={(e) => setUnitData(item?.id, e.target)}
            style={inputStyle}
            disabled={edit === "view"}
          />

          <TextField
            size="small"
            type="number"
            className="w-1/3"
            value={item?.glh}
            name="glh"
            placeholder={`Enter a GLH`}
            onChange={(e) => setUnitData(item?.id, e.target)}
            style={inputStyle}
            disabled={edit === "view"}
          />

          <Box className="flex items-center justify-between">
            {edit !== "view" && (
              <SecondaryButton
                name="Add Sub Unit"
                className="min-w-112"
                onClick={() => addSubUnitHandler(item?.id)}
              />
            )}
          </Box>
        </div>
        {item?.subUnit?.length > 0 &&
          item?.subUnit.map((subItem) => {
            return (
              <>
                <div className="w-full flex gap-24 ">
                  <div className="w-full">
                    <TextField
                      size="small"
                      type="text"
                      className="w-full"
                      name="subTitle"
                      placeholder={`Enter a sub-title`}
                      value={subItem?.subTitle}
                      onChange={(e) =>
                        setSubUnitData(item?.id, subItem?.id, e.target)
                      }
                      style={inputStyle}
                      disabled={edit === "view"}
                    />
                  </div>
                  <Box className="flex justify-between pt-10 mr-auto">
                    {edit !== "view" && (
                      <>
                        <Tooltip title="Remove sub unit">
                          <CloseIcon
                            className="cursor-pointer"
                            onClick={() =>
                              removeSubUnitHandler(
                                item?.id,
                                subItem?.id
                              )
                            }
                          />
                        </Tooltip>
                      </>
                    )}
                  </Box>
                  <div className="w-full flex flex-col">
                    {subItem?.subTopic?.length > 0 &&
                      subItem?.subTopic?.map((topicItem, index) => {
                        return (
                          <>
                            <div className="w-full flex flex-row gap-24 items-center ">
                              <TextField
                                size="small"
                                type="text"
                                className="w-full"
                                name="description"
                                placeholder={`Enter a description`}
                                value={topicItem?.description}
                                onChange={(e) =>
                                  setSubTopicData(
                                    item?.id,
                                    subItem?.id,
                                    topicItem?.id,
                                    e.target
                                  )
                                }
                                style={inputStyle}
                                disabled={edit === "view"}
                              />
                              <div className="min-w-160">
                                <Box className="w-full flex items-center justify-between gap-24">
                                  {edit !== "view" && (
                                    <>
                                      <Tooltip title="Remove sub topic">
                                        <CloseIcon
                                          className="cursor-pointer "
                                          onClick={() =>
                                            removeSubTopicHandler(
                                              item?.id,
                                              subItem?.id,
                                              topicItem?.id
                                            )
                                          }
                                        />
                                      </Tooltip>
                                      {index === 0 && (
                                        <SecondaryButton
                                          name="Add Topic"
                                          className="w-full"
                                          onClick={() =>
                                            addTopicHandler(
                                              item?.id,
                                              subItem?.id
                                            )
                                          }
                                        />
                                      )}
                                    </>
                                  )}
                                </Box>
                              </div>
                            </div>
                          </>
                        );
                      })}
                  </div>
                </div>
              </>
            );
          })}
      </div>
    }}
  />
}

const CourseBuilder = (props) => {
  const { edit = "create", handleClose = () => { } } = props;

  const navigate = useNavigate();
  const dispatch: any = useDispatch();
  const { preFillData } = useSelector(selectCourseManagement);
  const [loading, setLoading] = useState(false);

  const courseType = [
    'A2 Level', 'AS Level', 'Btec National', 'CORE', 'Core Skills - Communication',
    'Core Skills - ICT', 'Core Skills - Numeracy', 'Core Skills - Problem Solving',
    'Core Skills - Unknown', 'Core Skills - Working with others', 'ERR',
    'FUNCTIONAL SKILLS', 'Functional Skills - ICT', 'Functional Skills - Maths',
    'Functional Skills English', 'Gateway', 'GCSE', 'Key Skills - Communication',
    'Key Skills - ICT', 'Key Skills - Improving own learning', 'Key Skills - Number',
    'Key Skills - unknown', 'MAIN', 'NVQ', 'PLTS', 'SVQ', 'TECH', 'VCQ', 'VRQ'
  ];

  console.log(true, "++++")
  const [courseData, setCourseData] = useState(() => {
    return {
      brand_guidelines: formatText(preFillData?.brand_guidelines) || "",
      course_code: preFillData?.course_code || "",
      course_name: preFillData?.course_name || "",
      guided_learning_hours: preFillData?.guided_learning_hours || "",
      level: preFillData?.level || "",
      operational_start_date: preFillData?.operational_start_date || "",
      overall_grading_type: preFillData?.overall_grading_type || "",
      permitted_delivery_types: preFillData?.permitted_delivery_types || "",
      course_type: preFillData?.course_type || "",
      qualification_status: preFillData?.qualification_status || "",
      qualification_type: preFillData?.qualification_type || "",
      recommended_minimum_age: preFillData?.recommended_minimum_age || "",
      sector: preFillData?.sector || "",
      total_credits: preFillData?.total_credits || "",
    };
  });

  const formatDate = (date) => {
    if (!date) return ""; // Return empty string if date is empty
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };

  const [mandatoryUnit, setMandatoryUnit] = useState(
    edit == "view" ? preFillData?.units
      : generateUnitObject(preFillData?.units)
  );

  const courseHandler = (event) => {
    if (edit == "view") {
      return;
    }
    const { name, value } = event.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addUnitHandler = () => {
    const id = Date.now();
    setMandatoryUnit((prev) => ({
      ...prev,
      [id]: {
        id,
        unit_ref: "",
        title: "",
        mandatory: true,
        level: null,
        glh: null,
        credit_value: null,
        subUnit: [],
      },
    }));
  };

  const addSubUnitHandler = (unitId) => {
    if (mandatoryUnit[unitId]) {
      const newTopicData = {
        id: Date.now() + Number((Math.random() * 10).toFixed(0)),
        description: "",
      };

      const newSubData = {
        id: Date.now(),
        subTitle: "",
        subTopic: [newTopicData],
      };

      setMandatoryUnit((prev) => ({
        ...prev,
        [unitId]: {
          ...prev[unitId],
          subUnit: [...prev[unitId].subUnit, newSubData],
        },
      }));
    }
  };

  const addTopicHandler = (unitId, subUnitId) => {
    if (mandatoryUnit[unitId]) {
      const newTopicData = {
        id: Date.now(),
        description: "",
      };
      setMandatoryUnit((prev) => ({
        ...prev,
        [unitId]: {
          ...prev[unitId],
          subUnit: prev[unitId].subUnit.map((sub) => {
            if (sub.id === subUnitId) {
              return {
                ...sub,
                subTopic: [...sub.subTopic, newTopicData],
              };
            }
            return sub;
          }),
        },
      }));
    }
  };

  const setUnitData = (unitId, data) => {
    if (edit === "view") {
      return;
    }

    setMandatoryUnit({
      ...mandatoryUnit,
      [unitId]: {
        ...mandatoryUnit[unitId],
        [data.name]: data.value,
      },
    });
  };

  const removeUnitHandler = (unitId) => {
    if (edit === "view") {
      return;
    }

    setMandatoryUnit((prev) => {
      const updatedUnits = { ...prev };
      delete updatedUnits[unitId];
      return updatedUnits;
    });
  };

  const setSubUnitData = (unitId, subUnitId, data) => {
    if (edit === "view") {
      return;
    }

    setMandatoryUnit((mandatoryUnit) => ({
      ...mandatoryUnit,
      [unitId]: {
        ...mandatoryUnit[unitId],
        subUnit: mandatoryUnit[unitId].subUnit.map((subUnit) =>
          subUnit.id === subUnitId
            ? { ...subUnit, [data.name]: data.value }
            : subUnit
        ),
      },
    }));
  };

  const removeSubUnitHandler = (unitId, subUnitId) => {
    if (edit === "view") {
      return;
    }

    setMandatoryUnit((prev) => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        subUnit: prev[unitId].subUnit.filter((sub) => sub.id !== subUnitId),
      },
    }));
  };

  const setSubTopicData = (unitId, subUnitId, subTopicId, data) => {
    if (edit == "view") {
      return;
    }

    setMandatoryUnit((mandatoryUnit) => {
      const unit = mandatoryUnit[unitId];
      if (!unit) return mandatoryUnit;

      return {
        ...mandatoryUnit,
        [unitId]: {
          ...unit,
          subUnit: unit.subUnit.map((subUnit) =>
            subUnit.id === subUnitId
              ? {
                ...subUnit,
                subTopic: subUnit.subTopic.map((subTopic) =>
                  subTopic.id === subTopicId
                    ? { ...subTopic, [data.name]: data.value }
                    : subTopic
                ),
              }
              : subUnit
          ),
        },
      };
    });

  };

  const removeSubTopicHandler = (unitId, subUnitId, subTopicId) => {
    if (edit === "view") {
      return;
    }

    setMandatoryUnit((prev) => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        subUnit: prev[unitId].subUnit.map((sub) =>
          sub.id === subUnitId
            ? {
              ...sub,
              subTopic: sub.subTopic.filter(
                (topic) => topic.id !== subTopicId
              ),
            }
            : sub
        ),
      },
    }));
  };

  const cancleCourseHandler = () => {
    navigate("/courseBuilder");
  };

  const createCouserHandler = async () => {
    const units = Object.values(mandatoryUnit).map((item: any) => {
      return {
        id: item.id,
        unit_ref: item.unit_ref,
        title: item.title,
        mandatory: item.mandatory,
        level: item.level,
        glh: item.glh,
        credit_value: item.credit_value,
        subUnit: item.subUnit,
      };
    });

    setLoading(true);
    let response = "";
    if (edit === "create") {
      response = await dispatch(createCourseAPI({ ...courseData, units }));
    } else if (edit === "edit") {
      response = await dispatch(updateCourseAPI(preFillData?.course_id, { ...courseData, units }));
      handleClose()
    }

    if (response) {
      navigate("/courseBuilder");
    }
    setLoading(false);
  };

  return (
    <Grid className="m-12 rounded-6" style={{ height: "full" }}>
      <div className="p-10">
        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Course Name<sup>*</sup>
            </Typography>
            <TextField
              name="course_name"
              size="small"
              placeholder="Enter Course Name"
              required
              fullWidth
              value={courseData.course_name}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.input_feald}
            />
          </div>
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Course Code<sup>*</sup>
            </Typography>
            <TextField
              name="course_code"
              size="small"
              placeholder="Enter Course Code"
              required
              fullWidth
              value={courseData?.course_code}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.input_feald}
            />
          </div>
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Level<sup>*</sup>
            </Typography>
            <TextField
              name="level"
              size="small"
              placeholder="Enter Level"
              type="number"
              required
              fullWidth
              value={courseData.level}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.input_feald}
            />
          </div>
        </Box>

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Sector
            </Typography>
            <TextField
              name="sector"
              size="small"
              placeholder="Enter Sector"
              fullWidth
              value={courseData.sector}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.input_feald}
            />
          </div>
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", width: "200px" }}
              className={Style.name}
            >
              Qualification Type
            </Typography>
            <TextField
              name="qualification_type"
              size="small"
              placeholder="Enter Qualification Type"
              fullWidth
              value={courseData.qualification_type}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.input_feald}
            />
          </div>

          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", width: "200px" }}
              className={Style.name}
            >
              Recommended Minimum age
            </Typography>
            <TextField
              name="recommended_minimum_age"
              size="small"
              placeholder="Enter Recommended Minimum age"
              fullWidth
              type="number"
              value={courseData.recommended_minimum_age}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.input_feald}
            />
          </div>
        </Box>
        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Total Credits
            </Typography>
            <TextField
              name="total_credits"
              type="number"
              size="small"
              placeholder="Enter Total Credits"
              fullWidth
              value={courseData.total_credits}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.input_feald}
            />
          </div>
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", width: "200px" }}
              className={Style.name}
            >
              Operational start date
            </Typography>
            <TextField
              name="operational_start_date"
              size="small"
              placeholder="YYYY-MM-DD"
              fullWidth
              type="date"
              value={formatDate(courseData.operational_start_date)}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.input_feald}
            />
          </div>
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", width: "200px" }}
              className={Style.name}
            >
              Qualification status
            </Typography>
            <TextField
              name="qualification_status"
              size="small"
              placeholder="Enter Qualification status"
              fullWidth
              value={courseData.qualification_status}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.input_feald}
            />
          </div>
        </Box>

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Guided Learning Hours
            </Typography>
            <TextField
              name="guided_learning_hours"
              size="small"
              placeholder="Enter Guided Learning Hours"
              fullWidth
              value={courseData.guided_learning_hours}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.last2_input_feald}
            />
          </div>
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Overall Grading Type
            </Typography>
            <TextField
              name="overall_grading_type"
              size="small"
              placeholder="Enter Overall Grading Type"
              fullWidth
              value={courseData.overall_grading_type}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.last2_input_feald}
            />
          </div>
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Course Type
            </Typography>
            <Autocomplete
              size="small"
              value={courseData?.course_type}
              onChange={(event, newValue) => {
                if (edit !== "view") {
                  setCourseData((prev) => ({
                    ...prev,
                    course_type: newValue || "",
                  }));
                }
              }}
              disabled={edit === "view"}
              options={courseType}
              className={Style.last2_input_feald}
              renderInput={(params) => <TextField  {...params} placeholder="Course Type" />}
            />
          </div>
        </Box>

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Course Guidelines
            </Typography>
            <TextField
              size="small"
              name="brand_guidelines"
              placeholder="Enter Course Guidelines"
              fullWidth
              multiline
              rows={5}
              value={courseData.brand_guidelines}
              onChange={courseHandler}
              disabled={edit === "view"}
              className={Style.last_input_feald}
            />
          </div>
        </Box>
        <hr />
        <Box className="m-12">
          <Box className="flex items-center justify-between">
            <Typography>Units</Typography>
            {edit !== "view" && (
              <SecondaryButton
                name="Add New Unit"
                onClick={() => addUnitHandler()}
              />
            )}
          </Box>
        </Box>


        {Object.values(mandatoryUnit)?.length ? (
          row(
            mandatoryUnit, // Render the item at the current index
            setUnitData,
            edit,
            removeUnitHandler,
            addSubUnitHandler,
            setSubUnitData,
            removeSubUnitHandler,
            setSubTopicData,
            removeSubTopicHandler,
            addTopicHandler
          )
        ) : (
          <div className="text-center opacity-50 mt-10 mb-10">
            Units have not been included.
          </div>
        )}



        {/* <Box className="m-12">
                <Box className="flex items-center justify-between">
                    <Typography>Optional Units</Typography>
                    {!edit &&
                        <SecondaryButton name="Add New" onClick={() => addUnitHandler()} />
                    }
                </Box>
                {Object.values(optionalUnit)?.length ?
                    <UnitManagementTable columns={courseManagementUnitColumn} edit={edit} setUnitData={setUnitData} removeUnitHandler={removeUnitHandler} rows={Object.values(optionalUnit)} />
                    :
                    <div className=' text-center opacity-50 mt-10 mb-10'>
                        Optional units have not been included.
                    </div>
                }
            </Box> */}
        <Box className="flex items-center justify-end mt-60">
          {loading ? (
            <LoadingButton className="w-1/12" />
          ) : (
            <>
              {edit === "view" ? (
                <SecondaryButtonOutlined
                  name="Close"
                  className=" w-1/12"
                  onClick={handleClose}
                />
              ) : (
                <SecondaryButtonOutlined
                  name="Close"
                  className=" w-1/12"
                  onClick={edit === "edit" ? handleClose : cancleCourseHandler}
                />
              )}
              {edit !== "view" && (
                <SecondaryButton
                  name={edit === "edit" ? "Update" : "Create"}
                  className=" w-1/12 ml-10"
                  onClick={createCouserHandler}
                />
              )}
            </>
          )}
        </Box>
      </div>
    </Grid>
  );
};



export default CourseBuilder;
