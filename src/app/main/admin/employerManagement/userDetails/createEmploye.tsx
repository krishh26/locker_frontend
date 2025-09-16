import {
    Box,
    Card,
    Grid,
    MenuItem,
    Select,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Alert,
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
import { useForm, Controller } from "react-hook-form";
import { useEffect, useRef } from "react";

const CreateEmployerDetails = (props) => {
    const navigate = useNavigate();
    const dispatch: any = useDispatch();
    const { dataUpdatingLoadding } = props;

    const [uploadedFile, setUploadedFile] = useState(null);
    console.log("🚀 ~ CreateEmployerDetails ~ uploadedFile:", uploadedFile)
    const [shouldScrollToError, setShouldScrollToError] = useState(false);

    // UK Postcode validation regex
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$/i;

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        watch,
        trigger,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            employer_name: "",
            msi_employer_id: "",
            business_department: "",
            business_location: "",
            branch_code: "",
            address_1: "",
            address_2: "",
            city: "",
            county: "",
            employer_county: "",
            postcode: "",
            business_category: "",
            number_of_employees: "",
            telephone: "",
            website: "",
            key_contact_name: "",
            key_contact_number: "",
            email: "",
            business_description: "",
            comments: "",
            assessment_date: "",
            assessment_renewal_date: "",
            insurance_renewal_date: "",
        },
    });

    // Scroll to first error field when there are validation errors
    useEffect(() => {
        if (shouldScrollToError && Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];
            
            // Try multiple selectors to find the input field
            let errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            
            // If not found, try finding by input type
            if (!errorElement) {
                errorElement = document.querySelector(`input[name="${firstErrorField}"]`);
            }
            
            // If still not found, try finding the TextField container
            if (!errorElement) {
                const fieldContainer = document.querySelector(`[data-field="${firstErrorField}"]`);
                if (fieldContainer) {
                    errorElement = fieldContainer.querySelector('input');
                }
            }
            
            if (errorElement) {
                errorElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                // Focus on the input after scrolling
                setTimeout(() => {
                    (errorElement as HTMLInputElement).focus();
                }, 500);
            }
            setShouldScrollToError(false);
        }
    }, [errors, shouldScrollToError]);

    const createUserHandler = async (data) => {
        try {
            const employerData = {
                ...data,
                file: uploadedFile,
            };
            await dispatch(createEmployerAPI(employerData));
            handleClose();
        } catch (err) {
            console.log(err);
        }
    };

    const onSubmit = async (data) => {
        // Trigger validation for all fields
        const isValid = await trigger();
        
        if (!isValid) {
            // Set flag to scroll to first error
            setShouldScrollToError(true);
            return;
        }
        
        // If validation passes, proceed with form submission
        await createUserHandler(data);
    };

    const fileTypes = ["PDF"];
    const handleFileChange = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await dispatch(uploadPDF(formData));
        setUploadedFile(response.data[0]);
    };

    const handleClose = () => {
        navigate("/admin/employer");
    };

    const formatDate = (date) => {
        if (!date) return "";
        const formattedDate = date.substr(0, 10);
        return formattedDate;
    };
    return (
        <div>
            <Breadcrumb
                linkData={[AdminRedirect, EmployerRedirect]}
                currPage="Create Employer"
            />
            <div className="mb-20 mx-20">
                <Card className="rounded-6 items-center" variant="outlined">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="h-full flex flex-col">
                            <Box>
                                <Grid xs={12} className="p-10 font-600 border-b-2 bg-gray-100">
                                    <p>Company</p>
                                </Grid>
                                
                                {/* Company Name and MIS ID */}
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
                                            Company Name <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <Controller
                                            name="employer_name"
                                            control={control}
                                            rules={{ required: "Company Name is required" }}
                                            render={({ field }) => (
                                                <div data-field="employer_name">
                                                    <TextField
                                                        {...field}
                                                        size="small"
                                                        placeholder="Company name"
                                                        fullWidth
                                                        error={!!errors.employer_name}
                                                        helperText={errors.employer_name?.message}
                                                    />
                                                </div>
                                            )}
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
                                            MIS ID <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <Controller
                                            name="msi_employer_id"
                                            control={control}
                                            rules={{ required: "MIS ID is required" }}
                                            render={({ field }) => (
                                                <div data-field="msi_employer_id">
                                                    <TextField
                                                        {...field}
                                                        type="number"
                                                        size="small"
                                                        placeholder="Enter ID"
                                                        fullWidth
                                                        error={!!errors.msi_employer_id}
                                                        helperText={errors.msi_employer_id?.message}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </Box>

                                {/* Business Department, Location, Branch Code */}
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
                                        <Controller
                                            name="business_department"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    placeholder="Business Department"
                                                    size="small"
                                                    fullWidth
                                                />
                                            )}
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
                                        <Controller
                                            name="business_location"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    placeholder="Business Location"
                                                    size="small"
                                                    fullWidth
                                                />
                                            )}
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
                                            Branch Code
                                        </Typography>
                                        <Controller
                                            name="branch_code"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="number"
                                                    placeholder="Branch Code"
                                                    size="small"
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </div>
                                </Box>

                                {/* Address 1 and Address 2 */}
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
                                            Address 1 <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <Controller
                                            name="address_1"
                                            control={control}
                                            rules={{ required: "Address 1 is required" }}
                                            render={({ field }) => (
                                                <div data-field="address_1">
                                                    <TextField
                                                        {...field}
                                                        size="small"
                                                        placeholder="Address"
                                                        fullWidth
                                                        error={!!errors.address_1}
                                                        helperText={errors.address_1?.message}
                                                    />
                                                </div>
                                            )}
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
                                            Address 2 <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <Controller
                                            name="address_2"
                                            control={control}
                                            rules={{ required: "Address 2 is required" }}
                                            render={({ field }) => (
                                                <div data-field="address_2">
                                                    <TextField
                                                        {...field}
                                                        size="small"
                                                        placeholder="Address"
                                                        fullWidth
                                                        error={!!errors.address_2}
                                                        helperText={errors.address_2?.message}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </Box>

                                {/* Town, County, Country, Postcode */}
                                <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
                                    <div className="w-1/4">
                                        <Typography
                                            sx={{
                                                fontSize: "0.9vw",
                                                marginBottom: "0.5rem",
                                                fontWeight: "500",
                                            }}
                                            className={Style.name}
                                        >
                                            Town <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <Controller
                                            name="city"
                                            control={control}
                                            rules={{ required: "Town is required" }}
                                            render={({ field }) => (
                                                <div data-field="city">
                                                    <TextField
                                                        {...field}
                                                        placeholder="City"
                                                        size="small"
                                                        fullWidth
                                                        error={!!errors.city}
                                                        helperText={errors.city?.message}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className="w-1/4">
                                        <Typography
                                            sx={{
                                                fontSize: "0.9vw",
                                                marginBottom: "0.5rem",
                                                fontWeight: "500",
                                            }}
                                            className={Style.name}
                                        >
                                            County <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <Controller
                                            name="county"
                                            control={control}
                                            rules={{ required: "County is required" }}
                                            render={({ field }) => (
                                                <div data-field="county">
                                                    <TextField
                                                        {...field}
                                                        placeholder="County"
                                                        size="small"
                                                        fullWidth
                                                        error={!!errors.county}
                                                        helperText={errors.county?.message}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className="w-1/4">
                                        <Typography
                                            sx={{
                                                fontSize: "0.9vw",
                                                marginBottom: "0.5rem",
                                                fontWeight: "500",
                                            }}
                                            className={Style.name}
                                        >
                                            Country <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <Controller
                                            name="employer_county"
                                            control={control}
                                            rules={{ required: "Country is required" }}
                                            render={({ field }) => (
                                                <div data-field="employer_county">
                                                    <TextField
                                                        {...field}
                                                        placeholder="Country"
                                                        size="small"
                                                        fullWidth
                                                        error={!!errors.employer_county}
                                                        helperText={errors.employer_county?.message}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className="w-1/4">
                                        <Typography
                                            sx={{
                                                fontSize: "0.9vw",
                                                marginBottom: "0.5rem",
                                                fontWeight: "500",
                                            }}
                                            className={Style.name}
                                        >
                                            Postcode <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <Controller
                                            name="postcode"
                                            control={control}
                                            rules={{
                                                required: "Postcode is required",
                                            }}
                                            render={({ field }) => (
                                                <div data-field="postcode">
                                                    <TextField
                                                        {...field}
                                                        placeholder="e.g., SW1A 1AA"
                                                        size="small"
                                                        fullWidth
                                                        error={!!errors.postcode}
                                                        helperText={errors.postcode?.message}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </Box>
                            </Box>

                            <Box>
                                <Grid xs={12} className="p-10 font-600 border-y-2 bg-gray-100">
                                    <p>Company Details</p>
                                </Grid>

                                {/* Business Category and Number of Employees */}
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
                                            Business Category
                                        </Typography>
                                        <Controller
                                            name="business_category"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl fullWidth size="small">
                                                    <Select
                                                        {...field}
                                                        displayEmpty
                                                        labelId="business-category-label"
                                                        id="business-category-select"
                                                    >
                                                        <MenuItem value="">
                                                            <em>Select Category</em>
                                                        </MenuItem>
                                                        <MenuItem value="Media and creative services">Media and creative services</MenuItem>
                                                        <MenuItem value="Mining, energy and utilities">Mining, energy and utilities</MenuItem>
                                                        <MenuItem value="Personal services">Personal services</MenuItem>
                                                        <MenuItem value="Professional and business services">Professional and business services</MenuItem>
                                                        <MenuItem value="Retail, hire and repair">Retail, hire and repair</MenuItem>
                                                        <MenuItem value="Transport and distribution">Transport and distribution</MenuItem>
                                                        <MenuItem value="Wholesale">Wholesale</MenuItem>
                                                        <MenuItem value="Agriculture, forestry and fishing">Agriculture, forestry and fishing</MenuItem>
                                                        <MenuItem value="Arts, sports and recreation">Arts, sports and recreation</MenuItem>
                                                        <MenuItem value="Catering and accommodation">Catering and accommodation</MenuItem>
                                                        <MenuItem value="Construction">Construction</MenuItem>
                                                        <MenuItem value="Education">Education</MenuItem>
                                                        <MenuItem value="Health and social care services">Health and social care services</MenuItem>
                                                        <MenuItem value="IT and telecommunications services">IT and telecommunications services</MenuItem>
                                                        <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                                                        <MenuItem value="Animal Care">Animal Care</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            )}
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
                                            Number of employees
                                        </Typography>
                                        <Controller
                                            name="number_of_employees"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="number"
                                                    size="small"
                                                    placeholder="Number of employees"
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </div>
                                </Box>

                                {/* Telephone and Website */}
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
                                            Telephone
                                        </Typography>
                                        <Controller
                                            name="telephone"
                                            control={control}
                                            render={({ field }) => (
                                                <MobileNumberInput
                                                    value={field.value}
                                                    handleChange={(e) => field.onChange(e)}
                                                    name="telephone"
                                                />
                                            )}
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
                                            Website
                                        </Typography>
                                        <Controller
                                            name="website"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    placeholder="https://example.com"
                                                    size="small"
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </div>
                                </Box>

                                {/* Key Contact Name, Key Contact Number, and Email */}
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
                                            Key Contact Name
                                        </Typography>
                                        <Controller
                                            name="key_contact_name"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    size="small"
                                                    placeholder="Contact Name"
                                                    fullWidth
                                                />
                                            )}
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
                                            Key Contact Number
                                        </Typography>
                                        <Controller
                                            name="key_contact_number"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    size="small"
                                                    placeholder="Contact Number"
                                                    fullWidth
                                                />
                                            )}
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
                                            Email
                                        </Typography>
                                        <Controller
                                            name="email"
                                            control={control}
                                            rules={{
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Please enter a valid email address"
                                                }
                                            }}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    size="small"
                                                    type="email"
                                                    placeholder="Email"
                                                    fullWidth
                                                    error={!!errors.email}
                                                    helperText={errors.email?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </Box>
                            </Box>

                            <Box>
                                <Grid xs={12} className="p-10 font-600 border-y-2 bg-gray-100">
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
                                        <Controller
                                            name="business_description"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    size="small"
                                                    placeholder="Business Description"
                                                    fullWidth
                                                    multiline
                                                    rows={8}
                                                    id="business-description"
                                                />
                                            )}
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
                                        <Controller
                                            name="comments"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    size="small"
                                                    placeholder="Comments"
                                                    fullWidth
                                                    multiline
                                                    rows={8}
                                                    id="comments"
                                                />
                                            )}
                                        />
                                    </div>
                                </Box>
                            </Box>

                            <Box>
                                <Grid xs={12} className="p-10 font-600 border-y-2 bg-gray-100">
                                    <p>Assessment Date</p>
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
                                        <Controller
                                            name="assessment_date"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="date"
                                                    size="small"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            )}
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
                                            Health and Safety Assessment Renewal Date
                                        </Typography>
                                        <Controller
                                            name="assessment_renewal_date"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="date"
                                                    size="small"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            )}
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
                                            Liability Insurance Renewal Date
                                        </Typography>
                                        <Controller
                                            name="insurance_renewal_date"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    type="date"
                                                    size="small"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </Grid>
                            </Box>

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
                                                            alt="Upload"
                                                            className="w-64 pb-8"
                                                        />
                                                    </div>
                                                    {uploadedFile ? (
                                                        <p className="text-center mb-4">{uploadedFile.key.split('/').pop()}</p>
                                                    ) : (
                                                        <>
                                                            <p className="text-center mb-4">
                                                                Drag and drop your files here or{" "}
                                                                <a className="text-blue-500 font-500">Browse</a>
                                                            </p>
                                                            <p className="text-center mb-4">
                                                                Max 10MB files are allowed
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            }
                                            handleChange={handleFileChange}
                                            name="file"
                                            types={fileTypes}
                                        />
                                    </div>
                                </Box>
                            </Box>

                            {/* Error Display for Required Fields */}
                            {Object.keys(errors).length > 0 && (
                                <Box className="m-12">
                                    <Alert severity="error">
                                        Please fill in all required fields marked with *
                                    </Alert>
                                </Box>
                            )}

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
                                            name="Save"
                                            style={{ width: "10rem" }}
                                            type="submit"
                                        />
                                    </>
                                )}
                            </Box>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default CreateEmployerDetails;
