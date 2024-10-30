import React, { useState } from "react";

import { NewTagDTO, Tag } from "../../domain/types/tags.js";
import ScreenContainer from "../components/ScreenContainer.js";
import { Alert, Spinner } from "@inkjs/ui";
import Form from "../components/Form/index.js";
import TextField from "../components/Form/TextField.js";
import { useTabFocusManager } from "../hooks/useTabFocusManager.js";
import { Box } from "ink";
import { ServiceSubmissionResult } from "../../domain/types/services.js";
import useCommands from "../hooks/useCommands.js";

interface SaveTagTemplateProps {
	onSubmit: (data: NewTagDTO) => Promise<{
		status: "success" | "error";
		message: string;
	}>;
	isSubmitting: boolean;
	isLoading: boolean;
	tags?: Tag[];
	tag?: Tag;
}

export default function SaveTagTemplate({
	onSubmit,
	isSubmitting,
	isLoading,
	tags,
	tag,
}: SaveTagTemplateProps) {
	const tagNames = tags
		? tags.filter((item) => item.id !== tag?.id).map((item) => item.name)
		: [];
	const { activeControl } = useTabFocusManager(2);
	const [submissionResult, setSubmissionResult] =
		useState<ServiceSubmissionResult>();

	useCommands([
		{
			id: "next-field",
			key: "tab",
			description: "Próximo campo",
		},
		{
			id: "previous-field",
			key: "shift+tab",
			description: "Campo anterior",
		},
		{
			id: "submit",
			key: "enter",
			description: "Salvar",
		},
	]);

	function handleSubmit(data: NewTagDTO) {
		onSubmit(data).then((result) => {
			setSubmissionResult(result);

			setTimeout(() => {
				setSubmissionResult(undefined);
			}, 3000);
		});
	}

	const title = tag ? "ALTERAR TAG" : "ADICIONAR TAG";

	let content;

	if (isLoading) {
		content = <Spinner label="Obtendo dados..." />;
	} else if (isSubmitting) {
		content = <Spinner label="Salvando tag..." />;
	} else {
		content = (
			<Form<NewTagDTO>
				onSubmit={handleSubmit}
				initialValues={tag}
				validate={validateForm.bind(null, tagNames)}
			>
				<TextField
					name="name"
					label="Digite o nome"
					placeholder="Nome da tag"
					isActive={activeControl === 0}
				/>

				<TextField
					name="content"
					label="Digite o conteúdo"
					isActive={activeControl === 1}
					placeholder="Projeto XTZ4124"
				/>
			</Form>
		);
	}

	return (
		<ScreenContainer
			title={title}
			instructions="Utilize ESC para voltar. Utilize TAB e SHIFT+TAB para alternar entre os campos. Utilize ENTER para submeter"
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

function validateForm(existingTagNames: string[], { name }: NewTagDTO) {
	if (!name?.trim()) {
		return { name: "O nome da tag é obrigatório" };
	}

	if (existingTagNames.includes(name)) {
		return { name: "Uma tag com o mesmo nome já existe" };
	}

	return undefined;
}
