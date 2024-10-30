import { useCallback, useEffect, useState } from "react";

export default function useData<T>({
	fetcher,
	onFetch,
	onRequest,
	onFail,
}: {
	fetcher: () => Promise<T>;
	onFetch?: (data: T) => void;
	onRequest?: () => void;
	onFail?: () => void;
}) {
	const [data, setData] = useState<T>();

	const getData = useCallback(() => {
		onRequest?.();

		return fetcher()
			.then((data) => {
				setData(data);

				return data;
			})
			.then(onFetch)
			.catch(onFail);
	}, []);

	useEffect(() => {
		getData();
	}, [getData]);

	return { data, refetch: getData };
}
