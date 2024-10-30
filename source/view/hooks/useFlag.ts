import { useState } from "react";

export default function useFlag(defaultValue?: boolean) {
	const [state, setState] = useState(!!defaultValue);

	return {
		value: state,
		set() {
			setState(true);
		},
		unset() {
			setState(false);
		},
		flip() {
			setState((state) => !state);
		},
		getSetter(newValue: boolean) {
			return setState.bind(null, newValue);
		},
		getFlipper() {
			return setState.bind(null, (state) => !state);
		},
	};
}
