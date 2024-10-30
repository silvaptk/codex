import React, { useMemo } from "react";

import useLoadingState from "../../hooks/useLoadingState.js";
import { NewTagDTO } from "../../../domain/types/tags.js";
import SaveTagTemplate from "../../templates/save-tag.js";
import useData from "../../hooks/useData.js";
import { getTags, updateTag } from "../../../services/data/tags.js";
import { ScreenProps } from "../../types/screen.js";
import { Exception } from "../../../domain/exceptions/index.js";
import { ServiceSubmissionResult } from "../../../domain/types/services.js";

export default function UpdateTagScreen({
	params,
}: ScreenProps<{ id: number }>) {
	const { id } = params;

	const loadingState = useLoadingState({ data: false, save: false });
	const { data: tags, refetch } = useData({
		fetcher: getTags,
		onRequest: loadingState.getSetter("data", true),
		onFetch: loadingState.getSetter("data", false),
	});

	const tag = useMemo(() => {
		return tags?.find((tag) => tag.id === id);
	}, [tags, id]);

	async function saveTag(data: NewTagDTO): Promise<ServiceSubmissionResult> {
		if (!id) {
			return { status: "error", message: "Não foi possível atualizar a tag" };
		}

		loadingState.flip("save");

		try {
			await updateTag({ ...data, id });
			loadingState.flip("save");
			await refetch();

			return {
				status: "success",
				message: "Tag atualizada com sucesso",
			};
		} catch (error) {
			let message = "Não foi possível atualizar a tag";

			if (error instanceof Exception) {
				message = error.getMessage();
			}

			return { status: "error", message };
		}
	}

	return (
		<SaveTagTemplate
			isLoading={loadingState.value.data}
			isSubmitting={loadingState.value.save}
			onSubmit={saveTag}
			tags={tags}
			tag={tag}
		/>
	);
}
