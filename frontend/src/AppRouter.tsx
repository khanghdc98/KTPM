import React from "react";
import {
	Route,
	RouterProvider,
	createBrowserRouter,
	createRoutesFromElements,
} from "react-router";
import { ResultPage } from "./page/ResultPage";
import { UserInputPage } from "./page/UserInputPage";
import { useAppSelector } from "./AppStore";
import LoadingPopup from "./component/popup/loading/LoadingPopup";
const HealthCheck = () => {
	return <div>OK</div>;
};

const routes = createBrowserRouter(
	createRoutesFromElements(
		<React.Fragment>
			<Route path="/health" element={<HealthCheck />} />
			<Route path="/">
				<Route path="" element={<UserInputPage />} />
				<Route path="result" element={<ResultPage />} />
			</Route>
		</React.Fragment>,
	),
);

const AppRouter = () => {
	const loadingMessage = useAppSelector((state) => state.app.loadingPopUpMessage);
	return (
		<React.Fragment>
			<RouterProvider router={routes} />
			{loadingMessage !== "" ? <LoadingPopup  /> : null}
		</React.Fragment>
	);
};

export default AppRouter;
