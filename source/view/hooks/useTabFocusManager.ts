import { useInput } from "ink";
import { useState } from "react";

export function useTabFocusManager(controlsAmount: number) {
	const [activeControl, setActiveControl] = useState(0);

	useInput((_, key) => {
		const goDown = key.tab && !key.shift;
		const goUp = key.tab && key.shift;

		if (goUp) {
			setActiveControl((state) => {
				if (state === 0) {
					return controlsAmount - 1;
				}

				return state - 1;
			});
		}

		if (goDown) {
			setActiveControl((state) => (state + 1) % controlsAmount);
		}
	});

	return {
		activeControl,
		reset() {
			setActiveControl(0);
		},
	};
}
