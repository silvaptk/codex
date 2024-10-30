import React from "react";
import { Router } from "./router.js";
import { CommandsProvider } from "./hooks/useCommands.js";

type Props = {};

export default function App({}: Props) {
	return (
		<CommandsProvider>
			<Router />
		</CommandsProvider>
	);
}
