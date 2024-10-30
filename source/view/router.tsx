import React, { createContext, useCallback, useContext, useState } from "react";
import {
	AddEntryScreen,
	HomeScreen,
	ReportsScreen,
	EntriesScreen,
	DataManagementScreen,
	TagsScreen,
	AddTagScreen,
} from "./screens/index.js";
import UpdateTagScreen from "./screens/update-tag/index.js";
import UpdateEntryScreen from "./screens/update-entry/index.js";
import { ScreenParams } from "./types/screen.js";

const SCREENS = {
	home: HomeScreen,
	reports: ReportsScreen,
	"add-entry": AddEntryScreen,
	entries: EntriesScreen,
	"manage-data": DataManagementScreen,
	tags: TagsScreen,
	"add-tag": AddTagScreen,
	"update-tag": UpdateTagScreen,
	"update-entry": UpdateEntryScreen
};

type ScreenKey = keyof typeof SCREENS;

const RouterContext = createContext<{
	navigate: (screen: ScreenKey, params?: ScreenParams) => void;
}>({
	navigate: () => {},
});

export function Router() {
	const [activeScreen, setActiveScreen] = useState<ScreenKey>(
		Object.keys(SCREENS)[0] as ScreenKey
	);
	const [screenParams, setScreenParams] = useState({});

	const Screen = SCREENS[activeScreen];

	const handleNavigation = useCallback(
		(newScreen: string, params?: ScreenParams) => {
			if (newScreen in SCREENS) {
				setActiveScreen(newScreen as ScreenKey);
				setScreenParams(params || {});
			}
		},
		[]
	);

	return (
		<RouterContext.Provider value={{ navigate: handleNavigation }}>
			<Screen navigate={handleNavigation} params={screenParams} />
		</RouterContext.Provider>
	);
}

export default function useRouter() {
	return useContext(RouterContext);
}
