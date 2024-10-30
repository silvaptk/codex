import React from "react";
import { ScreenProps } from "../../types/screen.js";
import useLoadingState from "../../hooks/useLoadingState.js";
import ManageDataTemplate from "../../templates/manage-data.js";
import useData from "../../hooks/useData.js";
import { getUserData, updateUserData } from "../../../services/data/user.js";
import { User } from "../../../domain/types/user.js";
import { ServiceSubmissionResult } from "../../../domain/types/services.js";
import useCommands from "../../hooks/useCommands.js";

interface DataManagementScreenProps extends ScreenProps {}

export default function DataManagementScreen({}: DataManagementScreenProps) {
	const loadingState = useLoadingState({ save: false, get: true });

	const { data: userData, refetch } = useData({
		fetcher: getUserData,
		onFetch: loadingState.getSetter("get", false),
	});

	useCommands([
		{ id: "next-field", key: "tab", description: "Próximo campo" },
		{ id: "previous-field", key: "shift+tab", description: "Campo anterior" },
		{ id: "submit", key: "enter", description: "Salvar" },
	]);

	async function saveData(updatedData: User): Promise<ServiceSubmissionResult> {
		try {
			loadingState.flip("save");
			await updateUserData(updatedData);
			await refetch();

			return {
				status: "success",
				message: "Dados salvos com sucesso!",
			};
		} catch {
			return {
				status: "error",
				message: "Erro ao salvar dados. Tente novamente depois!",
			};
		} finally {
			loadingState.flip("save");
		}
	}

	return (
		<ManageDataTemplate
			loadingState={loadingState.value}
			onSave={saveData}
			data={userData}
		/>
	);
}
