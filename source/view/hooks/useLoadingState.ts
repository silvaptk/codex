import { useCallback, useState } from "react";

interface State {
	[key: string]: boolean;
}

export default function useLoadingState<T extends State>(initialState: T) {
	const [loadingState, setLoadingState] = useState(initialState);

	const merge = useCallback((partialState: Partial<T>) => {
		setLoadingState((state) => ({ ...state, ...partialState }));
	}, []);

	const set = useCallback((key: keyof T, value: boolean) => {
		setLoadingState((state) => ({ ...state, [key]: value }));
	}, []);

	const flip = useCallback((key: keyof T) => {
		setLoadingState((state) => ({ ...state, [key]: !state[key] }));
	}, []);

	const getSetter = useCallback(
		(key: keyof T, value: boolean) => set.bind(null, key, value),
		[set]
	);

	const getFlipper = useCallback(
		(key: keyof T) => flip.bind(null, key),
		[flip]
	);

	return {
		value: loadingState,
		merge,
		set,
		flip,
		getSetter,
		getFlipper,
	};
}
