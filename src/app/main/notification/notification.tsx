import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { SecondaryButton } from "src/app/component/Buttons";
import { Button, Tooltip } from "@mui/material";
import { useSelector } from "react-redux";
import { deleteNotifications, fetchNotifications, selectnotificationSlice } from "app/store/notification";
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

  const { notification } = useSelector(selectnotificationSlice);

  const dispatch: any = useDispatch()

  const handleRemoveAll = async () => {
    await dispatch(deleteNotifications())
    dispatch(fetchNotifications())
  };

  const handleRemove = async (id) => {
    await dispatch(deleteNotifications(id))
    dispatch(fetchNotifications())
  };

  return (
    <>
      <TableContainer sx={{ padding: 1 }}>
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
            {notification
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
                        <Tooltip placement="bottom-start" title={value?.length > 125 ? value : ""}>
                          <TableCell key={column.notification_id} align={column.align}>
                            {column.format && typeof value === "number"
                              ? column.format(value)
                              : value?.length > 125 ? value.slice(0, 125) + '...' : value}
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
    </>
  );
};

export default Activity;
