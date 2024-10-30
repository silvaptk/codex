import React, { useState } from "react";
import { Alert, Spinner } from "@inkjs/ui";

import { User } from "../../domain/types/user.js";
import Form from "../components/Form/index.js";
import TextField from "../components/Form/TextField.js";
import { useTabFocusManager } from "../hooks/useTabFocusManager.js";
import ScreenContainer from "../components/ScreenContainer.js";
import { Box } from "ink";
import { ServiceSubmissionResult } from "../../domain/types/services.js";

interface UserValues {
	hourValue: string;
	hoursGoal: string;
}

interface ManageDataTemplateProps {
	data?: User;
	loadingState: { save: boolean; get: boolean };
	onSave: (newData: User) => Promise<ServiceSubmissionResult>;
}

export default function ManageDataTemplate({
	data,
	loadingState,
	onSave,
}: ManageDataTemplateProps) {
	const { activeControl } = useTabFocusManager(2);
	const [submissionResult, setSubmissionResult] =
		useState<ServiceSubmissionResult>();

	function handleSubmit(data: UserValues) {
		onSave({
			hoursGoal: Number(data.hoursGoal),
			hourValue: Number(data.hourValue),
		}).then((result) => {
			setSubmissionResult(result);

			setTimeout(() => {
				setSubmissionResult(undefined);
			}, 3000);
		});
	}

	let content;

	if (loadingState.get) {
		content = <Spinner label="Carregando dados..." />;
	} else if (loadingState.save) {
		content = <Spinner label="Salvando dados..." />;
	} else {
		content = (
			<Form<UserValues>
				onSubmit={handleSubmit}
				initialValues={{
					hourValue: data?.hourValue.toString(),
					hoursGoal: data?.hoursGoal.toString(),
				}}
				validate={validateData}
			>
				<TextField
					name="hourValue"
					isActive={activeControl === 0}
					label="Digite o valor da hora"
					placeholder="100"
				/>
				<TextField
					name="hoursGoal"
					isActive={activeControl === 1}
					label="Digite a meta de horas para o mês"
					placeholder="160"
				/>
			</Form>
		);
	}

	return (
		<ScreenContainer
			title="GERENCIE SEUS DADOS"
			instructions="Utilize ESC para voltar. Utilize TAB e SHIFT+TAB para alterar entre os campos. Utilize ENTER para submeter"
		>
			{content}

			{submissionResult && (
				<Box width={submissionResult.message.length + 8}>
					<Alert variant={submissionResult.status}>
						{submissionResult.message}
					</Alert>
				</Box>
			)}
		</ScreenContainer>
	);
}

function validateData(values: UserValues) {
	const errors = { hourValue: "", hoursGoal: "" };

	const { hourValue, hoursGoal } = values;

	if (!hourValue?.trim()) {
		errors.hourValue = "O valor da hora é obrigatório";
	} else if (!Number(hourValue)) {
		errors.hourValue = "Insira um valor válido (ex.: 45)";
	}

	if (!hoursGoal?.trim()) {
		errors.hoursGoal = "O valor da meta de horas é obrigatório";
	} else if (!Number(hoursGoal) || !Number.isInteger(Number(hoursGoal))) {
		errors.hoursGoal = "Insira um número válido (ex.: 180)";
	}

	if (Object.values(errors).some(Boolean)) {
		return errors;
	}

	return undefined;
}
