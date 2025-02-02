import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type React from "react";
import { useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { Provider } from "react-redux";
import { sliceApp } from "./slice/slice-app";

const makeStore = () => {
	return configureStore({
		devTools: {
			name: "Admin",
		},
		reducer: combineReducers({
			app: sliceApp.reducer,
		}),
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([]),
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
	const storeRef = useRef<AppStore>(null);
	if (!storeRef.current) {
		storeRef.current = makeStore();
	}

	return <Provider store={storeRef.current}> {children} </Provider>;
};

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;
export const appActions = sliceApp.actions;
