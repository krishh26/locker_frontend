import React, { useEffect, useState } from "react";
import Breadcrumb from "src/app/component/Breadcrumbs";
import { SecondaryButton } from "src/app/component/Buttons";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { AdminRedirect, learnerManagementTableColumn } from "src/app/contanst";
import Style from '../style.module.css'
import { useSelector } from "react-redux";
import { Card, Dialog, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import UserDetails from "./usetDetails";
import { useDispatch } from "react-redux";
import Close from "@mui/icons-material/Close";
import SearchIcon from '@mui/icons-material/Search';
import { emailReg, mobileReg, nameReg, passwordReg, usernameReg } from "src/app/contanst/regValidation";
import { createLearnerAPI, fetchLearnerAPI, getRoleAPI, selectLearnerManagement, updateLearnerAPI } from "app/store/learnerManagement";
import LearnerManagementTable from "src/app/component/Table/LearnerManagementTable";
import { fetchCourseAPI } from "app/store/courseManagement";
import { getEmployerAPI } from "app/store/employer";

const Index = () => {

  const { data, dataFetchLoading, dataUpdatingLoadding, meta_data } = useSelector(selectLearnerManagement)
  const dispatch: any = useDispatch();

  const [open, setOpen] = useState(false);
  const [updateData, setUpdateData] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    dispatch(fetchLearnerAPI())
    dispatch(fetchCourseAPI())
  }, [dispatch])

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    email: "",
    password: "",
    confrimpassword: "",
    mobile: "",
    employer_id: "",
    funding_body: "",
    national_ins_no: ""
  })

  const [userDataError, setUserDataError] = useState({
    first_name: false,
    last_name: false,
    user_name: false,
    email: false,
    password: false,
    confrimpassword: false,
    mobile: false,
    employer_id: false,
    funding_body: false,
  })

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    resetValue();
    setUpdateData("");
    setOpen(false);
  };

  const handleUpdate = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }))
    setUserDataError((prev) => ({ ...prev, [name]: false }))
  }

  const resetValue = () => {
    setUserData({
      first_name: "",
      last_name: "",
      user_name: "",
      email: "",
      password: "",
      confrimpassword: "",
      mobile: "",
      employer_id: "",
      funding_body: "",
      national_ins_no: ""
    });
    setUserDataError({
      first_name: false,
      last_name: false,
      user_name: false,
      email: false,
      password: false,
      confrimpassword: false,
      mobile: false,
      employer_id: false,
      funding_body: false
    })
  }

  const createUserHandler = async () => {
    if (validation()) {
      const response = await dispatch(createLearnerAPI(userData));
      if (response) {
        resetValue();
        setOpen(false);
      }
    }
  }

  const updateUserHandler = async () => {
    const response = await dispatch(updateLearnerAPI(updateData, userData));
    if (response) {
      handleClose();
      setUpdateData("");
      setOpen(false);
    }
  }

  const searchByKeywordUser = (e) => {
    if (e.key === "Enter") {
      searchAPIHandler();
    }
  }

  const searchHandler = (e) => {
    setSearchKeyword(e.target.value);
  }

  const searchAPIHandler = () => {
    dispatch(fetchLearnerAPI({ page: 1, page_size: 10 }, searchKeyword));
  }

  useEffect(() => {
    dispatch(getRoleAPI("Trainer"));
    dispatch(getRoleAPI("IQA"));
    dispatch(getRoleAPI("EQA"));
    dispatch(getRoleAPI("Employer"));
    dispatch(getRoleAPI("LIQA"));
    dispatch(getEmployerAPI());
  }, []);

  const validation = () => {

    setUserDataError({
      first_name: !nameReg.test(userData?.first_name),
      last_name: !nameReg.test(userData?.last_name),
      user_name: !usernameReg.test(userData?.user_name),
      email: !emailReg.test(userData?.email),
      password: !passwordReg.test(userData?.password),
      confrimpassword: userData?.password !== userData?.confrimpassword || !passwordReg.test(userData?.password),
      mobile: !mobileReg.test(userData.mobile),
      employer_id: userData?.employer_id === "",
      funding_body: userData?.funding_body === "",
    })
    if (nameReg.test(userData?.first_name) &&
      nameReg.test(userData?.last_name) &&
      usernameReg.test(userData?.user_name) &&
      emailReg.test(userData?.email) &&
      passwordReg.test(userData?.password) &&
      userData?.password === userData?.confrimpassword &&
      mobileReg.test(userData.mobile) &&
      userData?.employer_id !== "",
      userData?.funding_body !== "") {
      return true;
    }
    return false
  }

  return (
    <Card className="m-12 rounded-6" style={{ height: "87.9vh" }}>
      <div className="w-full h-full">
        <Breadcrumb linkData={[AdminRedirect]} currPage="Learner" />

        <div className={Style.create_user}>
          <div className={Style.search_filed}>
            <TextField
              label="Search by keyword"
              fullWidth
              size="small"
              className="w-1/2"
              onKeyDown={searchByKeywordUser}
              onChange={searchHandler}
              value={searchKeyword}
              InputProps={{
                endAdornment:
                  <InputAdornment position="end" >
                    {
                      searchKeyword ? (
                        <Close
                          onClick={() => {
                            setSearchKeyword("");
                            dispatch(fetchLearnerAPI({ page: 1, page_size: 10 }, ""));
                          }}
                          sx={{
                            color: "#5B718F",
                            fontSize: 18,
                            cursor: "pointer",
                          }}
                        />
                      ) :
                        <IconButton
                          id="dashboard-search-events-btn"
                          disableRipple
                          sx={{ color: "#5B718F" }}
                          onClick={() => searchAPIHandler()}
                          size="small"
                        >
                          <SearchIcon fontSize="small" />
                        </IconButton>
                    }
                  </InputAdornment>
              }}
            />
          </div>
          <SecondaryButton name="Create learner" onClick={handleOpen} startIcon={
            <img
              src="assets/images/svgimage/createcourseicon.svg"
              alt="Create user"
              className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
            />
          } />

        </div>
        {
          data.length ?
            <LearnerManagementTable
              columns={learnerManagementTableColumn}
              rows={data}
              handleOpen={handleOpen}
              setUserData={setUserData}
              setUpdateData={setUpdateData}
              meta_data={meta_data}
              dataUpdatingLoadding={dataUpdatingLoadding}
              search_keyword={searchKeyword}
            />
            :
            <div className="flex flex-col justify-center items-center gap-10 " style={{ height: "94%" }}>
              <DataNotFound width="25%" />
              <Typography variant="h5">No data found</Typography>
              <Typography variant="body2" className="text-center">It is a long established fact that a reader will be <br />distracted by the readable content.</Typography>
            </div>

        }
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          sx={{
            '.MuiDialog-paper': {
              borderRadius: "4px",
              padding: "1rem"
            }
          }}
        >
          <UserDetails
            handleClose={handleClose}
            updateData={Boolean(updateData)}
            userData={userData}
            handleUpdate={handleUpdate}
            createUserHandler={createUserHandler}
            updateUserHandler={updateUserHandler}
            dataUpdatingLoadding={dataUpdatingLoadding}
            userDataError={userDataError}
          />
        </Dialog>
      </div >
    </Card>
  );
};

export default Index;

