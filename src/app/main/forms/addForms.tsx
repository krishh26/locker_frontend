import { FormBuilder as FormBuilderIo, Form } from "react-formio";
import "formiojs/dist/formio.full.css";
import "./style.css";
import { Grid, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  createFormDataAPI,
  createUserFormDataAPI,
  getFormDataAPI,
  getUserFormDataAPI,
  selectFormData,
  slice,
  updateFormDataAPI,
} from "app/store/formData";
import { useSelector } from "react-redux";
import "formiojs/dist/formio.full.css";
import { display } from "@mui/system";
import { UserRole } from "src/enum";
import { selectUser } from "app/store/userSlice";
import { User } from "@auth0/auth0-react";

const AddForms = (props) => {
  const { data, formDataDetails, dataUpdatingLoadding, singleData, mode } =
    useSelector(selectFormData);
  console.log(formDataDetails);

  const user = useSelector(selectUser)?.data;

  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const [formData, setFormData] = useState({
    id: null,
    form_name: "",
    description: "",
    form_data: [],
    type: "",
  });

  useEffect(() => {
    if ((mode === "view" || mode === "edit") && singleData) {
      setFormData({
        id: singleData.id,
        form_name: singleData.form_name,
        description: singleData.description,
        form_data: singleData?.form_data?.map((item: any) => {
          const { id, ...rest } = item;
          return rest;
        }),
        // form_data:  singleData.form_data,
        type: singleData.type,
      });
    }
  }, [mode, singleData]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css";
    link.id = "external-css";

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleCloseForm = () => {
    navigate("/forms");
    dispatch(slice.setSingleData({}));
    dispatch(slice.setMode(""));
    setFormData({
      id: null,
      form_name: "",
      description: "",
      form_data: [],
      type: "",
    });
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (mode == "") response = await dispatch(createFormDataAPI(formData));
      else if (mode == "edit")
        response = await dispatch(updateFormDataAPI(formData));
    } catch (err) {
      console.log(err);
    } finally {
      handleCloseForm();
    }
  };

  useEffect(() => {
    if (user.role !== UserRole.Admin)
      dispatch(getUserFormDataAPI(singleData.id));
  }, [dispatch]);

  const handleSubmitForm = async (data) => {
    try {
      let response;
      if (user.role !== UserRole.Admin) {
        response = await dispatch(
          createUserFormDataAPI({ form_id: singleData.id, form_data: data })
        );
        navigate("/forms");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const isFormData =
    Object.values(formData).find((data) => data === "") === undefined;

  return (
    <Grid className="p-10 m-10">
      {user.role === UserRole.Admin && (
        <Grid className="flex pb-10 mb-10 gap-10 input_container">
          <Grid className="w-full">
            <Typography
              sx={{
                fontSize: "0.9vw",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
              className="name"
            >
              Form Name
            </Typography>
            <TextField
              name="form_name"
              value={formData?.form_name}
              size="small"
              placeholder="Enter form name"
              required
              fullWidth
              onChange={handleChange}
              className="bg-none input"
              disabled={mode === "view"}
            />
          </Grid>

          <Grid className="w-full">
            <Typography
              sx={{
                fontSize: "0.9vw",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
              className="name"
            >
              Description
            </Typography>
            <TextField
              name="description"
              size="small"
              placeholder="Enter description"
              fullWidth
              multiline
              rows={1}
              value={formData?.description}
              onChange={handleChange}
              disabled={mode === "view"}
              className="input"
            />
          </Grid>

          <Grid className="w-full">
            <Typography
              sx={{
                fontSize: "0.9vw",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
              className="name"
            >
              Select Type
            </Typography>
            <Select
              name="type"
              value={formData?.type}
              size="small"
              placeholder="Select Type"
              required
              fullWidth
              onChange={handleChange}
              disabled={mode === "view"}
              className="input"
            >
              <MenuItem value={"ILP"}>ILP</MenuItem>
              <MenuItem value={"Review"}>Review</MenuItem>
              <MenuItem value={"Enrolment"}>Enrolment</MenuItem>
              <MenuItem value={"Survey"}>Survey</MenuItem>
              <MenuItem value={"Workbook"}>Workbook</MenuItem>
              <MenuItem value={"Test/Exams"}>Test/Exams</MenuItem>
              <MenuItem value={"Other"}>Other</MenuItem>
            </Select>
          </Grid>
        </Grid>
      )}
      <Grid>
        {mode === "view" || user.role !== UserRole.Admin ? (
          <Form
            form={{
              display: "form",
              components: formData?.form_data || [],
            }}
            submission={{ ...formDataDetails }}
            // onSubmit={(data) => { console.log(formData?.form_data, "++++++++++++++++++++++++++++++++++++", data) }}
            onSubmit={handleSubmitForm}
          />
        ) : (
          <FormBuilderIo
            form={{
              display: "form",
              components: formData?.form_data || [],
            }}
            onChange={(schema) =>
              setFormData({ ...formData, form_data: schema.components })
            }
          />
        )}
      </Grid>
      <Grid className="bottom-0 right-0 w-full flex justify-end gap-10">
        {dataUpdatingLoadding && user.role === UserRole.Admin ? (
          <LoadingButton />
        ) : (
          <>
            <SecondaryButtonOutlined onClick={handleCloseForm} name="Cancel" />
            {mode !== "view" && user.role === UserRole.Admin && (
              <SecondaryButton
                name={mode === "edit" ? "Update Form" : "Create Form"}
                onClick={handleSubmit}
                disable={!isFormData}
              />
            )}
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default AddForms;
