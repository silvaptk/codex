import React from "react";

import { ScreenProps } from "../../types/screen.js";
import useLoadingState from "../../hooks/useLoadingState.js";
import useData from "../../hooks/useData.js";
import { getTags } from "../../../services/data/tags.js";
import { addEntry } from "../../../services/data/entries.js";
import { NewEntryDTO } from "../../../domain/types/entries.js";
import SaveEntryTemplate from "../../templates/save-entry.js";
import { ServiceSubmissionResult } from "../../../domain/types/services.js";
import { Exception } from "../../../domain/exceptions/index.js";

interface AddEntryScreenProps extends ScreenProps {}

export default function AddEntryScreen({}: AddEntryScreenProps) {
	const loadingState = useLoadingState({
		store: false,
		tags: true,
	});

	const { data: tags } = useData({
		fetcher: getTags,
		onRequest: loadingState.getSetter("tags", true),
		onFetch: loadingState.getSetter("tags", false),
	});

	async function storeEntry(
		data: NewEntryDTO
	): Promise<ServiceSubmissionResult> {
		loadingState.flip("store");

		try {
			await addEntry(data);
			return { message: "Apontamento inserido com sucesso", status: "success" };
		} catch (thrown) {
			let message = "Não foi possível inserir o apontamento";

			if (thrown instanceof Exception) {
				message = thrown.getMessage();
			} else {
				console.error(thrown);
			}

			return { message, status: "error" };
		} finally {
			loadingState.flip("store");
		}
	}

	return (
		<SaveEntryTemplate
			tags={tags}
			onSubmit={storeEntry}
			isLoading={loadingState.value.tags}
			isSubmitting={loadingState.value.store}
		/>
	);
}
