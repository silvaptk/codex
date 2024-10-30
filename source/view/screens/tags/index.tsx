import React from "react";
import { ScreenProps } from "../../types/screen.js";
import TagsTemplate from "../../templates/tags.js";
import useData from "../../hooks/useData.js";
import { getTagReports, removeTag } from "../../../services/data/tags.js";
import useLoadingState from "../../hooks/useLoadingState.js";
import { Exception } from "../../../domain/exceptions/index.js";
import { ServiceSubmissionResult } from "../../../domain/types/services.js";

interface TagsScreenProps extends ScreenProps {}

export default function TagsScreen({ navigate }: TagsScreenProps) {
	const loadingState = useLoadingState({ get: true, remove: false });

	const { data: tags, refetch } = useData({
		fetcher: getTagReports,
		onFetch: loadingState.getSetter("get", false),
		onRequest: loadingState.getSetter("get", true),
	});

	function handleTagUpdate(tagId: number) {
		navigate("update-tag", { id: tagId });
	}

	async function handleTagRemoval(
		tagId: number
	): Promise<ServiceSubmissionResult> {
		loadingState.flip("remove");

		try {
			await removeTag(tagId);
			await refetch();

			return {
				status: "success",
				message: "Tag removida com sucesso!",
			};
		} catch (thrown) {
			let message = "Erro ao remover a tag";

			if (thrown instanceof Exception) {
				message = thrown.getMessage();
			}

			return {
				status: "error",
				message,
			};
		} finally {
			loadingState.flip("remove");
		}
	}

	return (
		<TagsTemplate
			tags={tags}
			onRemove={handleTagRemoval}
			onUpdate={handleTagUpdate}
			loadingState={loadingState.value}
		/>
	);
}
