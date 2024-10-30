import React, { ReactNode, useEffect, useMemo, useState } from "react";
import ScreenContainer from "../../components/ScreenContainer.js";
import useData from "../../hooks/useData.js";
import {
	getEntries,
	removeEntry,
	toggleEntryFlag,
} from "../../../services/data/entries.js";
import { formatDate, minutesToHour, subtractHours } from "../../utils/date.js";
import OptionsList from "../../components/OptionsList.js";
import { Box, Text, useInput } from "ink";
import { Alert, Spinner } from "@inkjs/ui";
import { Entry } from "../../../domain/types/entries.js";
import clipboardy from "clipboardy";
import useRouter from "../../router.js";
import ConfirmationBox from "../../components/ConfirmationBox.js";
import useLoadingState from "../../hooks/useLoadingState.js";
import useFlag from "../../hooks/useFlag.js";
import { ServiceSubmissionResult } from "../../../domain/types/services.js";
import { Exception } from "../../../domain/exceptions/index.js";
import useCommands from "../../hooks/useCommands.js";

export interface EntryFilters {
	search: string;
	tagIds?: number[];
	day?: Date;
}

interface EntriesTemplateProps {}

export default function EntriesTemplate({}: EntriesTemplateProps) {
	const [activeEntry, setActiveEntry] = useState<Entry>();
	const [removalResult, setRemovalResult] = useState<ServiceSubmissionResult>();
	const [flagToggleResult, setFlagToggleResult] =
		useState<ServiceSubmissionResult>();

	const removalConfirmationVisibility = useFlag();
	const loadingState = useLoadingState({
		get: true,
		remove: false,
		tags: true,
		toggleFlag: false,
	});
	const { data: entries, refetch } = useData({
		fetcher: getEntries,
		onFetch: loadingState.getSetter("get", false),
		onRequest: loadingState.getSetter("get", true),
	});

	const router = useRouter();

	useEffect(() => {
		if (entries) {
			setActiveEntry(entries[0]);
		}
	}, [entries]);

	useInput((input) => {
		if (input.toLowerCase() === "c") {
			handleCopyEntry();
		}

		if (input.toLowerCase() === "a") {
			handleEditEntry();
		}

		if (input.toLowerCase() === "r") {
			removalConfirmationVisibility.flip();
		}

		if (input.toLowerCase() === "m") {
			handleToggleEntryFlag();
		}
	});

	useCommands([
		{
			id: "copy",
			key: "c",
			description: "Copiar",
		},
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
		{
			id: "toggle-flag",
			key: "m",
			description: "Marcar/Desmarcar"
		}
	]);

	function handleActiveEntryChange(newEntryId: string) {
		setActiveEntry(entries?.find((entry) => entry.id === +newEntryId));
	}

	function handleCopyEntry() {
		if (!activeEntry) {
			return;
		}

		clipboardy.writeSync(
			`${activeEntry.startingHour} às ${activeEntry.endingHour} - ${parsedEntryDescription}`
		);
	}

	function handleEditEntry() {
		if (activeEntry) {
			router.navigate("update-entry", { id: activeEntry.id });
		}
	}

	function handleToggleEntryFlag() {
		if (!activeEntry) {
			return;
		}

		loadingState.flip("toggleFlag");
		toggleEntryFlag(activeEntry.id)
			.then(() => {
				setFlagToggleResult({
					message: activeEntry.isFlagged
						? "Entrada desmaracada com sucesso"
						: "Entrada marcada com sucesso",
					status: "success",
				});

				refetch();
			})
			.catch(() => {
				setFlagToggleResult({
					message: activeEntry.isFlagged
						? "Não foi possível desmaracar a entrada"
						: "Não foi possível marcar a entrada",
					status: "error",
				});
			})
			.finally(() => {
				setTimeout(() => {
					setFlagToggleResult(undefined);
				}, 5000);

				loadingState.flip("toggleFlag");
			});
	}

	async function handleRemoveEntry() {
		if (!activeEntry) {
			return;
		}

		loadingState.flip("remove");

		try {
			const entryId = activeEntry?.id;

			await removeEntry(entryId);
			await refetch();

			setRemovalResult({
				message: "Apontamento removido com sucesso",
				status: "success",
			});
		} catch (thrown) {
			let message = "Apontamento removido com sucesso";

			if (thrown instanceof Exception) {
				message = thrown.getMessage();
			}

			setRemovalResult({
				message,
				status: "success",
			});
		} finally {
			loadingState.flip("remove");
			removalConfirmationVisibility.flip();

			setTimeout(() => {
				setRemovalResult(undefined);
			}, 3000);
		}
	}

	const entriesAsOptions = (entries || []).map((entry) => ({
		value: entry.id.toString(),
		label: `${formatDate(new Date(entry.date))} ${entry.startingHour}${
			entry.isFlagged ? " ✓" : ""
		}`,
	}));

	const parsedEntryDescription = useMemo(() => {
		if (!activeEntry?.description) {
			return "";
		}

		let result = activeEntry.description;

		activeEntry.tags.forEach((tag, index) => {
			const tagPlaceholder = `@${index + 1}`;

			result = result.replace(
				new RegExp(tagPlaceholder, "g"),
				tag.content || ""
			);
		});

		return result;
	}, [activeEntry]);

	if (loadingState.value.get) {
		return <Spinner label="Carregando dados..." />;
	}

	return (
		<ScreenContainer
			title="APONTAMENTOS"
			instructions="Utilize ESC para voltar. Utilize as SETAS para navegar entre os apontamentos. Pressione C para copiar os dados do apontamento. Pressione A para alterar o apontamento. Pressione R para remover o apontamento"
		>
			<Box gap={4}>
				<Box paddingY={1} flexShrink={0}>
					<OptionsList
						options={entriesAsOptions}
						onChange={handleActiveEntryChange}
						isDisabled={removalConfirmationVisibility.value}
						maxLength={12}
						minWidth={20}
					/>
				</Box>

				{!!activeEntry && !removalConfirmationVisibility.value && (
					<Box
						borderRight={false}
						borderTop={false}
						borderBottom={false}
						borderStyle="single"
						flexDirection="column"
						gap={1}
						paddingLeft={4}
						paddingY={1}
					>
						<Box gap={4}>
							<EntryDetail
								title="Data"
								description={formatDate(new Date(activeEntry.date))}
							/>
							<EntryDetail
								title="Hora inicial"
								description={activeEntry.startingHour}
							/>
							<EntryDetail
								title="Hora final"
								description={activeEntry.endingHour}
							/>
							<EntryDetail
								title="Duração"
								description={minutesToHour(
									subtractHours(
										activeEntry.endingHour,
										activeEntry.startingHour
									)
								)}
							/>
						</Box>

						{activeEntry.description && (
							<EntryDetail
								title="Descrição"
								description={parsedEntryDescription}
							/>
						)}

						{!!activeEntry.tags.length && (
							<EntryDetail title="Tags">
								{activeEntry.tags.map((tag) => (
									<Text key={tag.id}>{tag.name}</Text>
								))}
							</EntryDetail>
						)}

						{!!removalResult && (
							<Box>
								<Alert variant={removalResult.status}>
									{removalResult.message}
								</Alert>
							</Box>
						)}

						{!!flagToggleResult && (
							<Box>
								<Alert variant={flagToggleResult.status}>
									{flagToggleResult.message}
								</Alert>
							</Box>
						)}
					</Box>
				)}

				{!!removalConfirmationVisibility && (
					<ConfirmationBox
						isVisible={removalConfirmationVisibility.value}
						onCancel={removalConfirmationVisibility.flip}
						onConfirm={handleRemoveEntry}
						isLoading={loadingState.value.remove}
						loadingText="Removendo..."
					>
						<Text>
							Tem certeza de que deseja remover a entrada?{" "}
							<Text color="red">Isso não pode ser desfeito</Text>
						</Text>
					</ConfirmationBox>
				)}
			</Box>
		</ScreenContainer>
	);
}

interface EntryDetailProps {
	title: string;
	description?: string;
	children?: ReactNode;
}

export function EntryDetail({
	title,
	description,
	children,
}: EntryDetailProps) {
	return (
		<Box flexDirection="column">
			<Text backgroundColor="white" color="black" bold>
				{title}
			</Text>
			{!!description && <Text>{description}</Text>}
			{children}
		</Box>
	);
}
