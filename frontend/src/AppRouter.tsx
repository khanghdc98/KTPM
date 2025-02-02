
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import { UserInputPage } from './page/UserInputPage'
import React from 'react'
import { ResultPage } from './page/ResultPage'
const HealthCheck = () => {
    return <div>OK</div>
}

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
)

const AppRouter = () => {
    return (
        <React.Fragment>
            <RouterProvider router={routes} />
        </React.Fragment>
    )
}

export default AppRouter
