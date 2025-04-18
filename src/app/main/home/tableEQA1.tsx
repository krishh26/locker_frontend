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
import { useDispatch } from "react-redux";
import { getEQAUserData, selectUserManagement } from "app/store/userManagement";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import { getRandomColor } from "src/utils/randomColor";
import CustomPagination from "src/app/component/Pagination/CustomPagination";
import { selectGlobalUser } from "app/store/globalUser";

function createData(
  avatarUrl: string,
  learnerName: string,
  course: string,
  trainerName: string,
  iqaName: string,
  status: string,
  iQAReports: string,
  samplingPlan: string
) {
  return {
    avatarUrl,
    learnerName,
    course,
    trainerName,
    iqaName,
    status,
    iQAReports,
    samplingPlan,
  };
}

const rows = [
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Frozen yoghurt",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt",
    "Frozen",
    "Frozen",
    "Frozen"
  ),
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Ice cream sandwich",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt",
    "Frozen",
    "Frozen",
    "Frozen"
  ),
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Eclair",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt",
    "Frozen",
    "Frozen",
    "Frozen"
  ),
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Cupcake",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt",
    "Frozen",
    "Frozen",
    "Frozen"
  ),
  createData(
    "assets/images/svgImage/eqaAvtar.svg",
    "Gingerbread",
    "A",
    "Frozen yoghurt",
    "Frozen yoghurt",
    "Frozen",
    "Frozen",
    "Frozen"
  ),
];

const TableEQA1 = (props) => {

  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

  const { learnerData, learner_meta_data } = useSelector(selectUserManagement);
  const dispatch: any = useDispatch();
  const { pagination } = useSelector(selectGlobalUser)

  useEffect(() => {
    dispatch(getEQAUserData({ page: 1, page_size: pagination?.page_size }, "learner_id", user?.user_id));
  }, [dispatch, pagination]);

  console.log("Learner Data:", learnerData);


  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(
      getEQAUserData({ page: newPage, page_size: pagination?.page_size }, "learner_id", user?.user_id)
    );
  };

  return (
    <>
      <div className="m-8">
        <TableContainer component={Paper} className="rounded-6 sm:h-[320px] sm:flex sm:flex-col sm:justify-between">
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead className="bg-[#F8F8F8]">
              <TableRow>
                <TableCell>Learner Name</TableCell>
                <TableCell align="left">Email</TableCell>
                <TableCell align="left">Funding Body</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {learnerData?.map((row) => (
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
                    {row?.email}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ borderBottom: "2px solid #F8F8F8" }}
                  >
                    {row?.funding_body}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <CustomPagination
            pages={learner_meta_data?.pages}
            page={learner_meta_data?.page}
            handleChangePage={handleChangePage}
            items={learner_meta_data?.items}
          />
        </TableContainer>
      </div>
    </>
  );
};

export default TableEQA1;
