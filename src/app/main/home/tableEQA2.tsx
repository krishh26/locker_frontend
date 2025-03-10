import React, { useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Avatar, Pagination, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import { getEQAUserData, selectUserManagement } from "app/store/userManagement";
import { useDispatch } from "react-redux";
import { getRandomColor } from "src/utils/randomColor";

function createData(
  avatarUrl: string,
  trainerName: string,
  trainersCV: string,
  trainersCPD: string,
  trainersCertificates: string
) {
  return {
    avatarUrl,
    trainerName,
    trainersCV,
    trainersCPD,
    trainersCertificates,
  };
}

const rows = [
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Frozen yoghurt",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt"
  ),
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Ice cream sandwich",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt"
  ),
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Eclair",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt"
  ),
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Cupcake",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt"
  ),
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Gingerbread",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt"
  ),
];

const TableEQA2 = () => {

  const { data } = useSelector(selectUser);
  const { trainerData } = useSelector(selectUserManagement);
  const dispatch: any = useDispatch();

  useEffect(() => {
    dispatch(getEQAUserData({ page: 1, page_size: 5 }, "trainer_id", data.user_id));
  }, [dispatch]);


  console.log("Tranier Data:", trainerData);


  return (
    <>
      <div className="m-8 mt-0">
        <TableContainer component={Paper} className="rounded-6">
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead className="bg-[#F8F8F8]">
              <TableRow>
                <TableCell>Trainer Name</TableCell>
                <TableCell align="left">Trainer's Roles</TableCell>
                <TableCell align="left">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trainerData?.map((row) => (
                <TableRow
                  key={row?.user_name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ borderBottom: "2px solid #F8F8F8" }}
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar
                        className="mr-4"
                        alt={row?.user_name}
                        src={row?.avatar?.url}
                        sx={{ width: 32, height: 32, marginRight: 1, backgroundColor: getRandomColor(row?.user_name?.toLowerCase().charAt(0)) }}
                      />
                      <Typography variant="body1">{row?.user_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ borderBottom: "2px solid #F8F8F8" }}
                  >
                    {row?.roles.join(", ")}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ borderBottom: "2px solid #F8F8F8" }}
                  >
                    {row.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Stack
            spacing={2}
            className="flex justify-center items-center w-full my-12"
          >
            <Pagination count={3} variant="outlined" shape="rounded" />
          </Stack>
        </TableContainer>
      </div>
    </>
  );
};

export default TableEQA2;
