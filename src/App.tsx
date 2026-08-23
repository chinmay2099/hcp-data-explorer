import { Container, Typography, Box, CircularProgress } from "@mui/material";
import { HcpTable } from "./components/HcpTable";
import { useHcpData } from "./hooks/useHcpData";

function App() {
  const { data, loading } = useHcpData();

  if (loading) {
    return (
      <div className="loading-container">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Loading data...</Typography>
        </Box>
      </div>
    );
  }

  return (
    <Container className="app-container" maxWidth={false} sx={{ px: 3 }}>
      <Box className="app-header" sx={{ mb: 3 }}>
        <Typography className="app-title" variant="h4">
          HCP Data Explorer
        </Typography>
        <Typography className="records-count" variant="body1">
          Total Records: {data.length.toLocaleString()}
        </Typography>
      </Box>
      <HcpTable data={data} />
    </Container>
  );
}

export default App;
