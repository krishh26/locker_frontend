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
  createTemplateData,
  createUserFormDataAPI,
  getUserFormDataAPI,
  selectFormData,
  slice,
  updateFormDataAPI,
  updateTemplate,
} from "app/store/formData";
import { useSelector } from "react-redux";
import "formiojs/dist/formio.full.css";
import { UserRole } from "src/enum";
import { selectUser } from "app/store/userSlice";
import { selectGlobalUser } from "app/store/globalUser";

const AddForms = (props) => {
  const { data, formDataDetails, dataUpdatingLoadding, singleData, mode, singleFrom = null, modeTemaplate = '' } = useSelector(selectFormData);

  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;
  const currentUser = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectGlobalUser)?.currentUser;

  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const [formData, setFormData] = useState({
    id: singleFrom?.id || null,
    form_name: singleFrom?.template_name || "",
    description: "",
    form_data: singleFrom?.data?.map((item: any) => {
      const { id, ...rest } = item;
      return rest;
    }) || [],
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
    dispatch(slice.setSingleData({
      form_data: []
    }));
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
    if (user.role !== UserRole.Admin) {
      const userId = currentUser.role !== UserRole.Admin ? currentUser.user_id : undefined;
      dispatch(getUserFormDataAPI(singleData.id, userId));
    }
  }, [dispatch]);

  const handleSubmitForm = async (data) => {
    try {
      if (user.role !== UserRole.Admin) {
        await dispatch(
          createUserFormDataAPI({ form_id: singleData.id, form_data: data, user_id: currentUser.user_id })
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      handleCloseForm()
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitTemplate = async () => {
    try {
      let response;
      const data = {
        template_name: formData.form_name || " ",
        data: formData.form_data,
      }
      if (modeTemaplate == "") response = await dispatch(createTemplateData(data));
      else if (modeTemaplate == "T")
        response = await dispatch(updateTemplate(formData?.id, data));
    } catch (err) {
      console.log(err);
    } finally {
      handleCloseForm();
    }
  }

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

            {mode !== "view" && user.role === UserRole.Admin && (
              <SecondaryButton
                name={modeTemaplate === "T" ? "Update Template" : "Create template"}
                onClick={handleSubmitTemplate}
              />
            )}
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default AddForms;
