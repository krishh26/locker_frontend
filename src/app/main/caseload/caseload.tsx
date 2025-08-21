// "use client";
// import { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   List,
//   ListItem,
//   ListItemText,
//   TextField,
//   MenuItem,
//   Button,
//   Pagination,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import jsPDF from "jspdf";
// import { applyPlugin } from 'jspdf-autotable'

// applyPlugin(jsPDF)

// export default function CaseloadPage() {
//   const [lineManagers, setLineManagers] = useState<any[]>([]);
//   const [filterName, setFilterName] = useState("");
//   const [filterRole, setFilterRole] = useState("");
//   const [page, setPage] = useState(1);
//   const rowsPerPage = 5;

//   // Mock API fetch – replace with your API
//   useEffect(() => {
//     async function fetchData() {
//       const data = [
//         {
//           id: 1,
//           name: "John Smith",
//           email: "john@example.com",
//           users: [
//             { id: 10, name: "Trainer One", email: "t1@example.com", role: "Trainer" },
//             { id: 11, name: "Trainer Two", email: "t2@example.com", role: "Trainer" },
//           ],
//         },
//         {
//           id: 2,
//           name: "Alice Brown",
//           email: "alice@example.com",
//           users: [
//             { id: 12, name: "Trainer Three", email: "t3@example.com", role: "Trainer" },
//           ],
//         },
//         {
//           id: 3,
//           name: "Michael Doe",
//           email: "michael@example.com",
//           users: [],
//         },
//         {
//           id: 4,
//           name: "Emily Davis",
//           email: "emily@example.com",
//           users: [
//             { id: 13, name: "Trainer Four", email: "t4@example.com", role: "Trainer" },
//             { id: 14, name: "Trainer Five", email: "t5@example.com", role: "Trainer" },
//           ],
//         },
//         {
//           id: 5,
//           name: "David Wilson",
//           email: "david@example.com",
//           users: [
//             { id: 15, name: "Trainer Six", email: "t6@example.com", role: "Trainer" },
//           ],
//         },
//         {
//           id: 6,
//           name: "Olivia Taylor",
//           email: "olivia@example.com",
//           users: [
//             { id: 16, name: "Trainer Seven", email: "t7@example.com", role: "Trainer" },
//           ],
//         },
//         {
//           id: 7,
//           name: "James Anderson",
//           email: "james@example.com",
//           users: [
//             { id: 17, name: "Trainer Eight", email: "t8@example.com", role: "Trainer" },
//           ],
//         },
//         // 👉 add more mock managers for testing pagination
//       ];
//       setLineManagers(data);
//     }
//     fetchData();
//   }, []);

//   // Filter logic
//   const filteredManagers = lineManagers.filter((manager) =>
//     manager.name.toLowerCase().includes(filterName.toLowerCase())
//   );

//   // Pagination logic
//   const totalPages = Math.ceil(filteredManagers.length / rowsPerPage);
//   const paginatedManagers = filteredManagers.slice(
//     (page - 1) * rowsPerPage,
//     page * rowsPerPage
//   );

//   // Export PDF
//   const handleExportPDF = () => {
//     const doc = new jsPDF();

//     doc.setFontSize(16);
//     doc.text("Caseload Report", 14, 15);

//     filteredManagers.forEach((manager, idx) => {
//       doc.setFontSize(12);
//       doc.text(
//         `${idx + 1}. Line Manager: ${manager.name} (${manager.email})`,
//         14,
//         25 + idx * 10
//       );

//       if (manager.users.length > 0) {
//         (doc as any).autoTable({
//           // startY: 30 + idx * 10,
//           head: [["Name", "Email", "Role"]],
//           body: manager.users.map((u) => [u.name, u.email, u.role]),
//           theme: "grid",
//           // margin: { left: 14, right: 14 },
//           // styles: { fontSize: 10 },
//         });
//       } else {
//         doc.text("No users assigned.", 20, 30 + idx * 10);
//       }
//     });

//     doc.save("caseload-report.pdf");
//   };

//   return (
//     <Box p={3}>
//       {/* Page Title */}
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h5">Caseload Management</Typography>
//         {/* <Button variant="contained" color="primary" onClick={handleExportPDF}>
//           Export PDF
//         </Button> */}
//       </Box>

//       {/* Filters */}
//       <Box
//         display="flex"
//         gap={2}
//         mb={3}
//         mt={2}
//         sx={{ flexWrap: "wrap", alignItems: "center" }}
//       >
//         <TextField
//           label="Search Line Manager"
//           variant="outlined"
//           size="small"
//           value={filterName}
//           onChange={(e) => setFilterName(e.target.value)}
//         />

//         <TextField
//           label="Filter by Role"
//           variant="outlined"
//           size="small"
//           select
//           value={filterRole}
//           onChange={(e) => setFilterRole(e.target.value)}
//           sx={{ minWidth: 200 }}
//         >
//           <MenuItem value="">All</MenuItem>
//           <MenuItem value="Trainer">Trainer</MenuItem>
//           <MenuItem value="OtherRole">Other Role</MenuItem>
//         </TextField>

//         <Button
//           variant="outlined"
//           onClick={() => {
//             setFilterName("");
//             setFilterRole("");
//           }}
//         >
//           Reset Filters
//         </Button>
//       </Box>

//       {/* Accordion List */}
//       {paginatedManagers.map((manager) => (
//         <Accordion key={manager.id}>
//           <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//             <Typography fontWeight="bold">
//               {manager.name} ({manager.email})
//             </Typography>
//           </AccordionSummary>
//           <AccordionDetails>
//             {manager.users.length > 0 ? (
//               <List>
//                 {manager.users
//                   .filter((u) =>
//                     filterRole ? u.role === filterRole : true
//                   )
//                   .map((user) => (
//                     <ListItem key={user.id} divider>
//                       <ListItemText
//                         primary={`${user.name} (${user.role})`}
//                         secondary={user.email}
//                       />
//                     </ListItem>
//                   ))}
//               </List>
//             ) : (
//               <Typography color="text.secondary">No users assigned.</Typography>
//             )}
//           </AccordionDetails>
//         </Accordion>
//       ))}

//       {/* No Data */}
//       {filteredManagers.length === 0 && (
//         <Typography color="text.secondary" mt={2}>
//           No Line Managers found.
//         </Typography>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <Box display="flex" justifyContent="center" mt={3}>
//           <Pagination
//             count={totalPages}
//             page={page}
//             onChange={(_, value) => setPage(value)}
//             color="primary"
//           />
//         </Box>
//       )}
//     </Box>
//   );
// }
'use client'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
  Button,
  Pagination,
  Grid,
  Collapse,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import jsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import { useGetCaseloadListQuery } from 'app/store/api/caseload-api'

applyPlugin(jsPDF)

export default function CaseloadPage() {
  const [filterName, setFilterName] = useState('')
  const [open, setOpen] = useState(false)

  const [filterRole, setFilterRole] = useState('')
  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  // ✅ Call API with params
  const { data, isLoading, isError } = useGetCaseloadListQuery({
    search: filterName,
    role: filterRole,
    page,
    limit: rowsPerPage,
    meta: true,
  })

  // ✅ Fallback if no data
  const lineManagers = data?.data || []
  const totalCount = data?.meta_data?.total_line_managers || 0
  const totalPages = Math.ceil(totalCount / rowsPerPage)

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Caseload Report', 14, 15)

    lineManagers.forEach((manager, idx) => {
      doc.setFontSize(12)
      doc.text(
        `${idx + 1}. Line Manager: ${manager.name} (${manager.email})`,
        14,
        25 + idx * 10
      )

      if (manager.users?.length > 0) {
        ;(doc as any).autoTable({
          head: [['Name', 'Email', 'Role']],
          body: manager.users.map((u) => [u.name, u.email, u.role]),
          theme: 'grid',
        })
      } else {
        doc.text('No users assigned.', 20, 30 + idx * 10)
      }
    })

    doc.save('caseload-report.pdf')
  }

  return (
    <Box p={3}>
      {/* Page Title */}
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography variant='h5'>Caseload Management</Typography>
        {/* <Button variant="contained" color="primary" onClick={handleExportPDF}>
          Export PDF
        </Button> */}
      </Box>

      {/* Filters */}
      <Box
        display='flex'
        gap={2}
        mb={3}
        mt={2}
        sx={{ flexWrap: 'wrap', alignItems: 'center' }}
      >
        <TextField
          label='Search Line Manager'
          variant='outlined'
          size='small'
          value={filterName}
          onChange={(e) => {
            setPage(1) // reset to page 1 on filter
            setFilterName(e.target.value)
          }}
        />

        {/* <TextField
          label='Filter by Role'
          variant='outlined'
          size='small'
          select
          value={filterRole}
          onChange={(e) => {
            setPage(1)
            setFilterRole(e.target.value)
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value=''>All</MenuItem>
          <MenuItem value='Trainer'>Trainer</MenuItem>
          <MenuItem value='OtherRole'>Other Role</MenuItem>
        </TextField> */}

        {/* <Button
          variant='outlined'
          onClick={() => {
            setFilterName('')
            setFilterRole('')
            setPage(1)
          }}
        >
          Reset Filters
        </Button> */}
      </Box>

      {/* Loader / Error */}
      {isLoading && <Typography>Loading...</Typography>}

      {/* Accordion List */}
      {lineManagers.map((manager: any) => (
        <Accordion key={manager.user_id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight='bold'>
              {manager.line_manager.full_name} ({manager.line_manager.email})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {[
                {
                  label: 'Active Users',
                  value: manager.statistics.active_users,
                  users: manager.managed_users, // link users here
                },
                {
                  label: 'Total Managed Learners',
                  value: manager.statistics.total_managed_learners,
                  users: [], // optional
                },
                {
                  label: 'Total Managed Users',
                  value: manager.statistics.total_managed_users,
                  users: manager.managed_users,
                },
              ].map((stat, idx) => {
                const colors = ['#E57373', '#64B5F6', '#81C784']
                const color = colors[idx % colors.length]

                return (
                  <Grid item xs={12} sm={3} key={stat.label}>
                    <Accordion disableGutters elevation={0}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          bgcolor: color,
                          color: 'white',
                          borderRadius: 2,
                          p: 2,
                          textAlign: 'center',
                          boxShadow: 2,
                        }}
                      >
                        <Box flex={1}>
                          <Typography variant='h6' fontWeight='bold'>
                            {stat.value}
                          </Typography>
                          <Typography variant='body2'>{stat.label}</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {stat.users && stat.users.length > 0 ? (
                          <List dense>
                            {stat.users.map((user: any) => (
                              <ListItem key={user.user_id} divider>
                                <ListItemText
                                  primary={`${user.first_name} ${
                                    user.last_name
                                  }`}
                                  secondary={user.email}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography color='text.secondary'>
                            No users assigned.
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* No Data */}
      {!isLoading && lineManagers.length === 0 && (
        <Typography color='text.secondary' mt={2}>
          No Line Managers found.
        </Typography>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display='flex' justifyContent='center' mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color='primary'
          />
        </Box>
      )}
    </Box>
  )
}
