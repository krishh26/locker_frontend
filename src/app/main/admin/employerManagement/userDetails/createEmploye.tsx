import {
    Box,
    Card,
    Grid,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import {
    AdminRedirect,
    EmployerRedirect,
} from "src/app/contanst";
import {
    LoadingButton,
    SecondaryButton,
    SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import { FileUploader } from "react-drag-drop-files";
import { useState } from "react";
import Breadcrumb from "src/app/component/Breadcrumbs";
import Style from "./style.module.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createEmployerAPI, uploadPDF } from "app/store/employer";
import MobileNumberInput from "src/app/component/Input/MobileNumberInput";

const CreateEmployerDetails = (props) => {

    const navigate = useNavigate();
    const dispatch: any = useDispatch();

    const [employerData, setEmployerDataData] = useState({
        employer_name: "",
        msi_employer_id: "",
        business_department: "",
        business_location: "",
        branch_code: "",
        address_1: "",
        address_2: "",
        city: "",
        country: "",
        postal_code: "",
        edrs_number: "",
        business_category: "",
        number: "",
        external_data_code: "",
        telephone: "",
        website: "",
        key_contact: "",
        email: "",
        business_description: "",
        comments: "",
        assessment_date: "",
        assessment_renewal_date: "",
        insurance_renewal_date: "",
        file: null
    });

    const handleDataUpdate = (e) => {
        const { name, value } = e.target;
        setEmployerDataData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const { dataUpdatingLoadding } = props;

    const createUser = Object.values(employerData).find((data) => data === "") === undefined

    const createUserHandler = async () => {
        try {
            let response;
            response = await dispatch(createEmployerAPI(employerData));
        } catch (err) {
            console.log(err);
        } finally {
            handleClose();
        }
    };

    const fileTypes = ["PDF"];
    const handleChange = async (file) => {
        const fromData = new FormData();
        fromData.append("file", file);

        const response = await dispatch(uploadPDF(fromData));
        setEmployerDataData(prevState => ({
            ...prevState,
            file: response.data[0]
        }));
    };

    const handleClose = () => {
        navigate("/admin/employer");
    };

    const formatDate = (date) => {
        if (!date) return "";
        const formattedDate = date.substr(0, 10);
        return formattedDate;
    };

    console.log(employerData)
    return (
        <div>
            <Breadcrumb
                linkData={[AdminRedirect, EmployerRedirect]}
                currPage="Create Employer"
            />
            <div className="mb-20 mx-20">
                <Card className="rounded-6 items-center " variant="outlined">
                    <div className="h-full flex flex-col">
                        <Box>
                            <Grid xs={12} className="p-10 font-600 border-b-2 bg-gray-100">
                                <p>Company</p>
                            </Grid>
                            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-1/2">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Company Name
                                    </Typography>
                                    <TextField
                                        name="employer_name"
                                        value={employerData?.employer_name}
                                        size="small"
                                        placeholder="Company name"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/2">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        MIS Employer ID
                                    </Typography>
                                    <TextField
                                        name="msi_employer_id"
                                        type="number"
                                        value={employerData?.msi_employer_id}
                                        size="small"
                                        placeholder="Enter ID"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>
                            </Box>
                            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Business Department
                                    </Typography>

                                    <TextField
                                        name="business_department"
                                        placeholder="Business Department"
                                        value={employerData?.business_department}
                                        size="small"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Business Location
                                    </Typography>
                                    <TextField
                                        name="business_location"
                                        placeholder="Business Location"
                                        value={employerData?.business_location}
                                        size="small"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/3 ">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Branch Code
                                    </Typography>
                                    <TextField
                                        name="branch_code"
                                        type="number"
                                        placeholder="Branch Code"
                                        value={employerData?.branch_code}
                                        size="small"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>
                            </Box>
                            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-1/2">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Address 1
                                    </Typography>
                                    <TextField
                                        name="address_1"
                                        value={employerData?.address_1}
                                        size="small"
                                        placeholder="Address"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/2">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Address 2
                                    </Typography>
                                    <TextField
                                        name="address_2"
                                        value={employerData?.address_2}
                                        size="small"
                                        placeholder="Address"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>
                            </Box>
                            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Town/City
                                    </Typography>

                                    <TextField
                                        name="city"
                                        placeholder="City"
                                        value={employerData?.city}
                                        size="small"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Country
                                    </Typography>
                                    <TextField
                                        name="country"
                                        placeholder="Country"
                                        value={employerData?.country}
                                        size="small"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/3 ">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Postal Code
                                    </Typography>
                                    <TextField
                                        name="postal_code"
                                        placeholder="Postal Code"
                                        type="number"
                                        value={employerData?.postal_code}
                                        size="small"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>
                            </Box>
                        </Box>

                        <Box>
                            <Grid xs={12} className="p-10 font-600 border-y-2 bg-gray-100 ">
                                <p>Company Details</p>
                            </Grid>

                            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        A44 - Employer Identifier / EDRS Number
                                    </Typography>
                                    <TextField
                                        name="edrs_number"
                                        type="number"
                                        value={employerData?.edrs_number}
                                        size="small"
                                        placeholder="ID"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Business Category
                                    </Typography>
                                    <Select
                                        name="business_category"
                                        value={employerData?.business_category}
                                        size="small"
                                        required
                                        fullWidth
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Category"
                                        onChange={handleDataUpdate}
                                    >
                                        <MenuItem value={"Media and creative services"}>Media and creative services</MenuItem>
                                        <MenuItem value={"Mining, energy and utilities"}>Mining, energy and utilities</MenuItem>
                                        <MenuItem value={"Personal services"}>Personal services</MenuItem>
                                        <MenuItem value={"Professional and business services"}>Professional and business services</MenuItem>
                                        <MenuItem value={"Retail, hire and repair"}>Retail, hire and repair</MenuItem>
                                        <MenuItem value={"Transport and distribution"}>Transport and distribution</MenuItem>
                                        <MenuItem value={"Wholesale"}>Wholesale</MenuItem>
                                        <MenuItem value={"Agriculture, forestry and fishing"}>Agriculture, forestry and fishing</MenuItem>
                                        <MenuItem value={"Arts, sports and recreation"}>Arts, sports and recreation</MenuItem>
                                        <MenuItem value={"Catering and accommodation"}>Catering and accommodation</MenuItem>
                                        <MenuItem value={"Construction"}>Construction</MenuItem>
                                        <MenuItem value={"Education"}>Education</MenuItem>
                                        <MenuItem value={"Health and social care services"}>Health and social care services</MenuItem>
                                        <MenuItem value={"IT and telecommunications servicesManufacturing"}>IT and telecommunications servicesManufacturing</MenuItem>
                                        <MenuItem value={"Manufacturing"}>Manufacturing</MenuItem>
                                        <MenuItem value={"Animal Care"}>Animal Care</MenuItem>
                                    </Select>
                                </div>

                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        # of Employee
                                    </Typography>
                                    <TextField
                                        name="number"
                                        type="number"
                                        value={employerData?.number}
                                        size="small"
                                        placeholder="number"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>
                            </Box>

                            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        External Data Code
                                    </Typography>

                                    <TextField
                                        name="external_data_code"
                                        placeholder="Code"
                                        type="number"
                                        value={employerData?.external_data_code}
                                        size="small"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Telephone
                                    </Typography>
                                    {/* <TextField
                                        name="telephone"
                                        type="number"
                                        placeholder="Phone Number"
                                        value={employerData?.telephone}
                                        size="small"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    /> */}
                                    <MobileNumberInput
                                        value={employerData?.telephone}
                                        handleChange={handleDataUpdate}
                                        name={"telephone"}
                                    />
                                </div>

                                <div className="w-1/3 ">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Website
                                    </Typography>
                                    <TextField
                                        name="website"
                                        placeholder="Link"
                                        value={employerData?.website}
                                        size="small"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>
                            </Box>

                            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-1/2">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Key Contact
                                    </Typography>
                                    <TextField
                                        name="key_contact"
                                        value={employerData?.key_contact}
                                        size="small"
                                        placeholder="Contact"
                                        required
                                        type="number"
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/2">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Email
                                    </Typography>
                                    <TextField
                                        name="email"
                                        value={employerData?.email}
                                        size="small"
                                        type="email"
                                        placeholder="Email"
                                        required
                                        fullWidth
                                        onChange={handleDataUpdate}
                                    />
                                </div>
                            </Box>
                        </Box>

                        <Box>
                            <Grid xs={12} className="p-10 font-600 border-y-2 bg-gray-100 ">
                                <p>Business Description / Comments</p>
                            </Grid>

                            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-1/2">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Business Description
                                    </Typography>
                                    <TextField
                                        name="business_description"
                                        value={employerData?.business_description}
                                        size="small"
                                        placeholder="Business Description"
                                        fullWidth
                                        multiline
                                        rows={8}
                                        id="outlined-multiline-static"
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/2">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Comments
                                    </Typography>
                                    <TextField
                                        name="comments"
                                        value={employerData?.comments}
                                        size="small"
                                        placeholder="Comments"
                                        required
                                        fullWidth
                                        multiline
                                        rows={8}
                                        id="outlined-multiline-static"
                                        onChange={handleDataUpdate}
                                    />
                                </div>
                            </Box>
                        </Box>

                        <Grid>
                            <Grid xs={12} className="p-10 font-600 border-y-2 bg-gray-100 ">
                                <p>Assesment Date</p>
                            </Grid>

                            <Grid className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Health and Safety Assessment Date
                                    </Typography>
                                    <TextField
                                        name="assessment_date"
                                        type="date"
                                        value={formatDate(employerData?.assessment_date)}
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Health and Safety Assessment renewal Date
                                    </Typography>
                                    <TextField
                                        name="assessment_renewal_date"
                                        type="date"
                                        value={formatDate(employerData?.assessment_renewal_date)}
                                        onChange={handleDataUpdate}
                                    />
                                </div>

                                <div className="w-1/3">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Liability Insurance renewal date
                                    </Typography>
                                    <TextField
                                        name="insurance_renewal_date"
                                        type="date"
                                        value={formatDate(employerData?.insurance_renewal_date)}
                                        onChange={handleDataUpdate}
                                    />
                                </div>
                            </Grid>
                        </Grid>

                        <Box>

                            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                <div className="w-full">
                                    <Typography
                                        sx={{
                                            fontSize: "0.9vw",
                                            marginBottom: "0.5rem",
                                            fontWeight: "500",
                                        }}
                                        className={Style.name}
                                    >
                                        Choose File for Employer
                                    </Typography>

                                    <FileUploader
                                        children={
                                            <div
                                                style={{
                                                    border: "1px dotted lightgray",
                                                    padding: "5rem",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <div className="flex justify-center mt-8">
                                                    <img
                                                        src="assets/images/svgImage/uploadimage.svg"
                                                        alt="Alert"
                                                        className="w-64 pb-8 "
                                                    />
                                                </div>
                                                {employerData?.file ? (
                                                    <p className="text-center mb-4">{employerData?.file.name}</p>
                                                ) : (
                                                    <>
                                                        <p className="text-center mb-4">
                                                            Drag and drop your files here or{" "}
                                                            <a className="text-blue-500 font-500 ">Browse</a>
                                                        </p>
                                                        <p className="text-center mb-4">
                                                            Max 10MB files are allowed
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        }
                                        handleChange={handleChange}
                                        name="file"
                                        types={fileTypes}
                                    />
                                </div>
                            </Box>
                        </Box>

                        <Box style={{ margin: "auto 1rem 1rem auto" }}>
                            {dataUpdatingLoadding ? (
                                <LoadingButton />
                            ) : (
                                <>
                                    <SecondaryButtonOutlined
                                        name="Cancel"
                                        onClick={handleClose}
                                        style={{ width: "10rem", marginRight: "2rem" }}
                                    />
                                    <SecondaryButton
                                        name={"Save"}
                                        style={{ width: "10rem" }}
                                        // disable={!createUser}
                                        onClick={createUserHandler}
                                    />
                                    {/* <SecondaryButton name={updateData ? "Update" : "Save"} style={{ width: "10rem" }} onClick={updateData ? updateUserHandler : createUserHandler} /> */}
                                </>
                            )}
                        </Box>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CreateEmployerDetails;
