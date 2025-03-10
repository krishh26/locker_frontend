import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { SecondaryButton } from "src/app/component/Buttons";
import { Button, Grid, Tooltip } from "@mui/material";
import { useSelector } from "react-redux";
import { deleteNotifications, selectnotificationSlice } from "app/store/notification";
import { useDispatch } from "react-redux";

interface Column {
  notification_id:
  | "title"
  | "message"
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { notification_id: "title", label: "Title", minWidth: 250 },
  { notification_id: "message", label: "message", minWidth: 1150 }
];


const Activity = () => {

  const [notifications, setNotifications] = React.useState([]);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const { notification } = useSelector(selectnotificationSlice);

  const dispatch: any = useDispatch()

  React.useEffect(() => {
    setNotifications(notification);
  }, [notification])

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRemoveAll = async () => {
    await dispatch(deleteNotifications())
    setNotifications([]);
  };

  const handleRemove = async (id) => {
    await dispatch(deleteNotifications(id))
    setNotifications(notifications.filter(row => row.notification_id !== id));
  };

  return (
    <>
      <TableContainer sx={{ maxHeight: 440, padding: 1 }}>
        <div className="flex space-x-4 mt-4 mb-10 mr-5 justify-end  ">
          <SecondaryButton name="Delete All" onClick={handleRemoveAll} />
        </div>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead className="max-w-max ">
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.notification_id}
                  align={column.align}
                  style={{
                    width: column.minWidth,
                    backgroundColor: "#F8F8F8",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications
              ?.map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                  >
                    {columns.map((column) => {
                      const value = row[column.notification_id];
                      return (
                        <Tooltip placement="bottom-start" title={value.length > 125 ? value : ""}>
                          <TableCell key={column.notification_id} align={column.align}>
                            {column.format && typeof value === "number"
                              ? column.format(value)
                              : value.length > 125 ? value.slice(0, 125) + '...' : value}
                          </TableCell>
                        </Tooltip>
                      );
                    })}
                    <Button className='p-0 min-w-36' onClick={() => handleRemove(row.notification_id)}>
                      <img
                        src="assets/images/svgImage/remove.svg"
                        alt="remove"
                      />
                    </Button>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="fixed bottom-0 left-0 w-full flex justify-center py-4 mb-14">
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={notifications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </>
  );
};

export default Activity;
