import React from "react";
import { ScreenProps } from "../../types/screen.js";
import SaveEntryTemplate from "../../templates/save-entry.js";
import useData from "../../hooks/useData.js";
import { getEntry, updateEntry } from "../../../services/data/entries.js";
import { NewEntryDTO } from "../../../domain/types/entries.js";
import useLoadingState from "../../hooks/useLoadingState.js";
import { ServiceSubmissionResult } from "../../../domain/types/services.js";
import { formatDate } from "../../utils/date.js";
import { getTags } from "../../../services/data/tags.js";
import { Exception } from "../../../domain/exceptions/index.js";

interface UpdateEntryScreenProps extends ScreenProps<{ id: number }> {}

export default function UpdateEntryScreen({ params }: UpdateEntryScreenProps) {
	const loadingState = useLoadingState({ get: true, save: false });
	const { data } = useData({
		fetcher: () => Promise.all([getEntry(params.id!), getTags()]),
		onFetch: loadingState.getSetter("get", false),
	});

	const entry = data?.[0];
	const tags = data?.[1];

	async function handleSubmit(
		updatedEntry: NewEntryDTO
	): Promise<ServiceSubmissionResult> {
		const id = entry!.id;

		loadingState.flip("save");

		try {
			await updateEntry(id, updatedEntry);
			return {
				message: "Apontamento atualizado com sucesso",
				status: "success",
			};
		} catch (thrown) {
			let message = "Não foi possível atualizar o apontamento";

			if (thrown instanceof Exception) {
				message = thrown.getMessage();
			} else {
				console.error(thrown);
			}

			return { message, status: "error" };
		} finally {
			loadingState.flip("save");
		}
	}

	const entryAsDTO = entry
		? {
				...entry,
				date: formatDate(new Date(entry.date)),
				tagIds: entry?.tags.map((tag) => tag.id).map(String) || [],
		  }
		: undefined;

	return (
		<SaveEntryTemplate
			onSubmit={handleSubmit}
			initialData={entryAsDTO}
			isLoading={loadingState.value.get}
			isSubmitting={loadingState.value.save}
			tags={tags}
		/>
	);
}
