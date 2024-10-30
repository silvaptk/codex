import React, { useEffect, useMemo, useState } from "react";
import { TagReport } from "../../domain/types/tags.js";
import ScreenContainer from "../components/ScreenContainer.js";
import { Box, Text, useInput } from "ink";
import OptionsList from "../components/OptionsList.js";
import { Alert, Spinner } from "@inkjs/ui";
import useFlag from "../hooks/useFlag.js";
import ConfirmationBox from "../components/ConfirmationBox.js";
import { ServiceSubmissionResult } from "../../domain/types/services.js";
import useCommands from "../hooks/useCommands.js";

interface TagsTemplateProps {
	tags?: TagReport[];
	onUpdate: (tagId: number) => void;
	onRemove: (tagId: number) => Promise<ServiceSubmissionResult>;
	loadingState: { get: boolean; remove: boolean };
}

export default function TagsTemplate({
	tags,
	loadingState,
	onUpdate,
	onRemove,
}: TagsTemplateProps) {
	const [focusedTagId, setFocusedTagId] = useState(tags?.[0]?.id);
	const [removalResult, setRemovalResult] = useState<ServiceSubmissionResult>();

	const removalConfirmationVisibility = useFlag();

	useCommands([
		{
			id: "update",
			key: "a",
			description: "Alterar",
		},
		{
			id: "remove",
			key: "r",
			description: "Remover",
		},
	]);

	useEffect(() => {
		if (!tags?.[0]) {
			return;
		}

		setFocusedTagId(tags[0].id);
	}, [tags]);

	function handleRemovalConfirmation() {
		if (!focusedTagId) {
			return;
		}

		onRemove(focusedTagId).then((result) => {
			removalConfirmationVisibility.flip();

			setRemovalResult(result);
			setTimeout(() => {
				setRemovalResult(undefined);
			}, 3000);
		});
	}

	useInput((input) => {
		if (input.toLowerCase() === "a" && focusedTagId) {
			onUpdate(focusedTagId);
		}

		if (input.toLowerCase() === "r") {
			removalConfirmationVisibility.flip();
		}
	});

	const focusedTag = useMemo(() => {
		return tags?.find((tag) => tag.id === focusedTagId);
	}, [focusedTagId]);

	useEffect(() => {
		if (loadingState.get) {
			return;
		}

		if (!tags?.length) {
			return;
		}

		const firstTagId = tags[0]?.id;

		setFocusedTagId((state) => state || firstTagId);
	}, [loadingState.get, tags]);

	let content;

	if (loadingState.get) {
		content = <Spinner label="Carregando dados..." />;
	} else if (!tags?.length || !focusedTag) {
		content = (
			<Box width={56}>
				<Alert variant="warning">Nenhuma tag encontrada.</Alert>
			</Box>
		);
	} else {
		content = (
			<Box gap={4}>
				<Box marginTop={1}>
					<OptionsList
						options={
							tags?.map((tag) => ({
								value: tag.id?.toString(),
								label: tag.name,
							})) || []
						}
						onChange={(tagId) => setFocusedTagId(Number(tagId))}
						minWidth={16}
						maxLength={5}
					/>
				</Box>

				{!removalConfirmationVisibility.value && (
					<Box
						gap={1}
						flexDirection="column"
						borderStyle="single"
						borderRight={false}
						borderTop={false}
						borderBottom={false}
						paddingX={4}
						paddingY={1}
					>
						{focusedTag.content && (
							<ReportEntry title="Conteúdo" description={focusedTag.content} />
						)}

						<Box gap={4}>
							<ReportEntry
								title="Apontamentos"
								description={`${focusedTag.entries} apontamentos`}
							/>
							<ReportEntry
								title="Horas"
								description={parseHours(focusedTag.hours)}
							/>
						</Box>

						{removalResult && (
							<Box>
								<Alert variant={removalResult.status}>
									{removalResult.message}
								</Alert>
							</Box>
						)}
					</Box>
				)}

				{removalConfirmationVisibility.value && (
					<ConfirmationBox
						isVisible
						onCancel={removalConfirmationVisibility.flip}
						onConfirm={handleRemovalConfirmation}
						isLoading={loadingState.remove}
					>
						<Text>
							Tem certeza de que deseja remover esta tag?{" "}
							<Text color="red">Isso não pode ser desfeito</Text>
						</Text>
					</ConfirmationBox>
				)}
			</Box>
		);
	}

	return (
		<ScreenContainer
			title="TAGS"
			instructions="Utilize ESC para voltar. Utilize as SETAS para navegar entre as tags. Pressione A para alterar a tag. Pressione R para remover a tag"
		>
			{content}
		</ScreenContainer>
	);
}

interface ReportEntryProps {
	title: string;
	description: string;
}

function ReportEntry({ title, description }: ReportEntryProps) {
	return (
		<Box flexDirection="column">
			<Text backgroundColor="white" color="black">
				{title}
			</Text>
			<Text>{description}</Text>
		</Box>
	);
}

function parseHours(hours: number) {
	const hoursAsMinutes = Math.round(hours * 60);

	return [Math.floor(hoursAsMinutes / 60), hoursAsMinutes % 60]
		.map((slice) => slice.toString().padStart(2, "0"))
		.join(":");
}
