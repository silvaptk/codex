import React from "react";
import { useInput } from "ink";

import { ScreenProps } from "../../types/screen.js";
import EntriesTemplate from "../../templates/entries/index.js";

interface EntriesScreenProps extends ScreenProps {}

export default function EntriesScreen({ navigate }: EntriesScreenProps) {
	useInput((_, key) => {
		if (key.escape) {
			navigate("home");
		}
	});

	return <EntriesTemplate />;
}
