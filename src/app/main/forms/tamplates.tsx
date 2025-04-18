import { useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useDispatch } from 'react-redux';
import { deleteTemplate, fetchTemplateData, selectFormData, slice } from 'app/store/formData';
import { useSelector } from 'react-redux';
import { IconButton, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import DataNotFound from 'src/app/component/Pages/dataNotFound';
import { SecondaryButton } from 'src/app/component/Buttons';

export default function Templates() {

    const { formTemplate } = useSelector(selectFormData);
    const dispatch: any = useDispatch();

    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchTemplateData());
    }, [])

    return (
        formTemplate?.length ?
            <TableContainer>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell width={600}>Template Name</TableCell>
                            <TableCell align='center'>Create Date</TableCell>
                            <TableCell align='center'>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formTemplate?.map((row) => (
                            <TableRow
                                key={row?.template_name
                                }
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" >
                                    {row?.template_name}
                                </TableCell>
                                <TableCell align='center'>{row?.created_at.split("T")[0]}</TableCell>
                                <TableCell align='center'>
                                    <div>
                                        <Tooltip title="Edit template">
                                            <IconButton onClick={() => {
                                                dispatch(slice.storeFormData({ data: row, mode: "T" }))
                                                navigate('/forms/create')
                                            }}>
                                                <EditIcon sx={{ color: "black", opacity: 0.7 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete template">
                                            <IconButton onClick={() => dispatch(deleteTemplate(row?.id))}>
                                                <DeleteIcon sx={{ color: "maroon", opacity: 0.7 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            :
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
                <SecondaryButton
                    name="Create Template"
                    className="p-12"
                    startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                    onClick={() => navigate('/forms/create')}
                />
            </div>
    );
}
