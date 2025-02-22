import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import AppRouter from "./AppRouter";
import { StoreProvider, useAppSelector } from "./AppStore";
import { DashboardAppBar } from "./component/AppBar";
import LoadingPopup from "./component/popup/loading/LoadingPopup";

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
				<Box
					component="main"
					sx={{ paddingTop: "48px", height: "100vh", overflow: "auto" }}
				>
					<AppRouter />
				</Box>
			</StoreProvider>
		</ThemeProvider>
	);
};

export default App;
