import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { DashboardAppBar } from './component/AppBar';
import { StoreProvider } from './AppStore';
import AppRouter from './AppRouter';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <StoreProvider>
        <DashboardAppBar />
        <CssBaseline enableColorScheme />
        <Box component="main" sx={{ paddingTop: '64px', height: '100vh', overflow: 'auto' }}>
          <AppRouter />
        </Box>
      </StoreProvider>
    </ThemeProvider>
  );
};

export default App;
