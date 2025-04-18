import { AddIcCallOutlined } from '@mui/icons-material'
import { Autocomplete, Box, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import { createContractWorkAPI, deleteContractWorkHandler, getContractWork, selectContractWork, updateContractWorkAPI } from 'app/store/contractedWork'
import { selectGlobalUser } from 'app/store/globalUser'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { DangerButton, LoadingButton, SecondaryButton, SecondaryButtonOutlined } from 'src/app/component/Buttons'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertDialog from 'src/app/component/Dialogs/AlertDialog'

const ContractedWorkHours = () => {

    const [hoursDialog, setHoursDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // New state for edit mode
    const [editRowId, setEditRowId] = useState(null); // New state for tracking the row being edited
    const [deleteId, setDeleteId] = useState(null);

    const dispatch: any = useDispatch();

    const globalUser = useSelector(selectGlobalUser)

    const { data } = useSelector(selectContractWork)

    const fetchContractWorkData = () => {
        dispatch(getContractWork(globalUser?.selectedUser?.learner_id));
    };

    useEffect(() => {
        fetchContractWorkData();
    }, [dispatch]);

    const [hoursData, setHoursData] = useState({
        learner_id: globalUser?.selectedUser?.learner_id,
        last_editer: globalUser?.currentUser?.user_id,
        company: "",
        contract_start: "",
        contract_end: "",
        contracted_work_hours_per_week: "",
        yearly_holiday_entitlement_in_hours: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setHoursData({ ...hoursData, [name]: value });
    };

    const addOrUpdateHours = async () => {
        setLoading(true);
        try {
            if (isEditMode && editRowId) {
                await dispatch(updateContractWorkAPI(editRowId, { ...hoursData }));
            } else {
                await dispatch(createContractWorkAPI({ ...hoursData }));
            }
        } catch (error) {
            console.error("Error during submission:", error);
        } finally {
            setLoading(false);
        }
        fetchContractWorkData();
        closeHoursDialog();
    };

    const openEditDialog = (row) => {
        setIsEditMode(true);
        setEditRowId(row?.id);
        setHoursData({
            learner_id: row?.learner_id,
            last_editer: globalUser?.currentUser?.user_id,
            company: row?.company,
            contract_start: formatDate(row?.contract_start),
            contract_end: formatDate(row?.contract_end),
            contracted_work_hours_per_week: row?.contracted_work_hours_per_week,
            yearly_holiday_entitlement_in_hours: row?.yearly_holiday_entitlement_in_hours,
        });
        setHoursDialog(true);
    };

    const closeHoursDialog = () => {
        setHoursDialog(false);
        setIsEditMode(false);
        setEditRowId(null);
        setHoursData({
            learner_id: globalUser?.selectedUser?.learner_id,
            last_editer: globalUser?.currentUser?.user_id,
            company: "",
            contract_start: "",
            contract_end: "",
            contracted_work_hours_per_week: "",
            yearly_holiday_entitlement_in_hours: "",
        })
    };

    const handleSetNewHours = () => {
        setHoursDialog(true);
    };

    const deleteConfromation = async () => {
        setLoading(true);
        try {
            await dispatch(deleteContractWorkHandler(deleteId)); // Assuming you have this action
            fetchContractWorkData();
        } catch (error) {
            console.error("Error during deletion:", error);
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return ""; // Return empty string if date is empty
        const formattedDate = date.substr(0, 10);
        return formattedDate;
    };

    return (
        <div>
            <div>
                <div>
                    <h1 className='font-semibold'>Contracted Work Hours</h1>
                </div>
                <div className='flex justify-center mt-32'>
                    <h5 className='font-normal w-[80%]'><strong>Please note: </strong>as this learner's expected off the job hours have been set as a fixed value, the contracted work hours and yearly holiday entitlement will not impact the off the job calculation for this learner.</h5>
                </div>
            </div>

            <div className='w-full flex justify-end my-20'>
                <SecondaryButton
                    name="Set New Hours"
                    className="py-6 px-12 mb-10"
                    onClick={() => handleSetNewHours()}
                />
            </div>

            <TableContainer sx={{ minHeight: 550, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                {/* {dataFetchLoading ? (
                    <FuseLoading />
                ) : innovation.data?.length ? ( */}
                <Table
                    sx={{ minWidth: 650, height: "100%" }}
                    size="small"
                    aria-label="simple table"
                >
                    <TableHead className="bg-[#F8F8F8]">
                        <TableRow>
                            <TableCell align="left">
                                Company
                            </TableCell>
                            <TableCell align="left">
                                Employment Contract Start
                            </TableCell>
                            <TableCell align="left">
                                Employment Contract End
                            </TableCell>
                            <TableCell align="left">
                                Contracted Work Hours per Week
                            </TableCell>
                            <TableCell align="left">
                                Yearly Holiday Entitlement in Hours
                            </TableCell>
                            <TableCell align="left">
                                Last Edited By
                            </TableCell>
                            <TableCell align="left">
                                Last Edited
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.map((row) => (
                            <TableRow
                                key={row?.id}
                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                            >
                                <TableCell
                                    align="left"
                                    className='max-w-[20rem] w-[20rem] overflow-hidden text-ellipsis whitespace-nowrap'
                                    sx={{
                                        borderBottom: "2px solid #F8F8F8",
                                    }}
                                >
                                    <div className='flex justify-between'>
                                        <div className='max-w-[16rem] w-[16rem] overflow-hidden text-ellipsis whitespace-nowrap'>
                                            <Tooltip title={row?.company} className='cursor-default'>
                                                {row?.company}
                                            </Tooltip>
                                        </div>

                                        <div>
                                            <EditIcon className='mr-5 w-16 h-16 cursor-pointer text-yellow-800' onClick={() => openEditDialog(row)} />
                                            <DeleteIcon className='w-16 h-16 cursor-pointer text-red-500' onClick={() => setDeleteId(row?.id)} />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell
                                    align="left"
                                    sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                                >
                                    {formatDate(row?.contract_start)}
                                </TableCell>
                                <TableCell
                                    align="left"
                                    sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                                >
                                    {formatDate(row?.contract_end)}
                                </TableCell>
                                <TableCell
                                    align="left"
                                    sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                                >
                                    {row?.contracted_work_hours_per_week}
                                </TableCell>
                                <TableCell
                                    align="left"
                                    sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                                >
                                    {row?.yearly_holiday_entitlement_in_hours}
                                </TableCell>
                                <TableCell
                                    align="left"
                                    sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                                >
                                    {row?.last_editer?.first_name} {row?.last_editer?.last_name}
                                </TableCell>
                                <TableCell
                                    align="left"
                                    sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                                >
                                    {formatDate(row?.updated_at)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* ) : (
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
                <CustomPagination
                    pages={meta_data?.pages}
                    page={meta_data?.page}
                    handleChangePage={handleChangePage}
                    items={meta_data?.items}
                /> */}
            </TableContainer>

            <AlertDialog
                open={Boolean(deleteId)}
                close={() => setDeleteId(null)}
                title="Delete Contracted Work Hours?"
                content="Deleting this will remove all associated data. Proceed with deletion?"
                className="-224"
                actionButton={
                    loading ? (
                        <LoadingButton />
                    ) : (
                        <DangerButton
                            onClick={deleteConfromation}
                            name="Delete Work Hours"
                        />
                    )
                }
                cancelButton={
                    <SecondaryButtonOutlined
                        className="px-24"
                        onClick={() => setDeleteId(null)}
                        name="Cancel"
                    />
                }
            />


            <Dialog
                open={hoursDialog}
                onClose={closeHoursDialog}
                fullWidth
                sx={{
                    ".MuiDialog-paper": {
                        borderRadius: "4px",
                        padding: "1rem",
                    },
                }}
            >
                <DialogTitle className='p-0'>
                    <Typography className="text-2xl font-semibold tracking-tight leading-tight m-10">
                        Contracted Work Hours
                    </Typography>
                    <hr />
                </DialogTitle>
                <DialogContent className='p-0 py-4 flex flex-col gap-5'>
                    <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                        <div className="w-full">
                            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                                Company
                            </Typography>
                            <Autocomplete
                                size="small"
                                sx={{
                                    ".muiltr-1okx3q8-MuiButtonBase-root-MuiIconButton-root-MuiAutocomplete-popupIndicator": { color: "black" },
                                }}
                                options={[
                                    "TEST TO DELETE",
                                    "Phoenix4Training LLP",
                                    "Postcode ME17 3DN",
                                    "Postcode SE28 8NZ",
                                    "Sams Home Services Ltd",
                                    "Secure Care Ltd.",
                                    "St. Christopher Homes Ltd.",
                                    "Staplehurst Transits Ltd.",
                                    "Taylis Homes Ltd.",
                                ]}
                                value={hoursData?.company}
                                onChange={(e, value) => setHoursData({ ...hoursData, company: value })}
                                renderInput={(params) => <TextField {...params} placeholder="Status" />}
                            />
                        </div>
                    </Box>
                    <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                        <div className="w-full">
                            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                                Employment Contract Start Date *
                            </Typography>
                            <TextField
                                name="contract_start"
                                value={hoursData?.contract_start}
                                size="small"
                                type="date"
                                required
                                fullWidth
                                onChange={handleInputChange}
                            />
                        </div>
                    </Box>
                    <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                        <div className="w-full">
                            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                                Employment Contract End Date
                            </Typography>
                            <TextField
                                name="contract_end"
                                value={hoursData?.contract_end}
                                size="small"
                                type="date"
                                required
                                fullWidth
                                onChange={handleInputChange}
                            />
                        </div>
                    </Box>
                    <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                        <div className="w-full">
                            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                                Contracted Work Hours per Week
                            </Typography>
                            <TextField
                                name="contracted_work_hours_per_week"
                                value={hoursData?.contracted_work_hours_per_week}
                                size="small"
                                type="number"
                                placeholder="0"
                                required
                                fullWidth
                                onChange={handleInputChange}
                            />
                        </div>
                    </Box>
                    <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
                        <div className="w-full">
                            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                                Yearly Holiday Entitlement in Hours
                            </Typography>
                            <TextField
                                name="yearly_holiday_entitlement_in_hours"
                                value={hoursData?.yearly_holiday_entitlement_in_hours}
                                size="small"
                                type="number"
                                placeholder="0"
                                required
                                fullWidth
                                onChange={handleInputChange}
                            />
                        </div>
                    </Box>
                </DialogContent>
                <DialogActions className='p-4'>
                    <div className="flex justify-end mt-4">
                        {loading ? (
                            <LoadingButton style={{ width: "10rem" }} />
                        ) : (
                            <>
                                <SecondaryButtonOutlined
                                    name="Cancel"
                                    style={{ width: "10rem", marginRight: "1rem" }}
                                    onClick={closeHoursDialog}
                                />
                                <SecondaryButton
                                    name={isEditMode ? "Update Hours" : "Add New Hours"}
                                    onClick={addOrUpdateHours}
                                />
                            </>
                        )}
                    </div>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default ContractedWorkHours