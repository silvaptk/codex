import React from "react";

import useLoadingState from "../../hooks/useLoadingState.js";
import { NewTagDTO } from "../../../domain/types/tags.js";
import SaveTagTemplate from "../../templates/save-tag.js";
import useData from "../../hooks/useData.js";
import { addTag, getTags } from "../../../services/data/tags.js";
import { Exception } from "../../../domain/exceptions/index.js";
import { ServiceSubmissionResult } from "../../../domain/types/services.js";

export default function AddTagScreen() {
	const loadingState = useLoadingState({ data: false, save: false });
	const { data: tags, refetch } = useData({
		fetcher: getTags,
		onRequest: loadingState.getSetter("data", true),
		onFetch: loadingState.getSetter("data", false),
	});

	async function saveTag(data: NewTagDTO): Promise<ServiceSubmissionResult> {
		loadingState.flip("save");

		try {
			await addTag(data);
			loadingState.flip("save");
			await refetch();

			return {
				status: "success",
				message: "Tag adicionada com sucesso",
			};
		} catch (error) {
			let message = "Não foi possível adicionar a tag";

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
		/>
	);
}
