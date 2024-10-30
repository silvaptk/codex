import React, { useEffect, useState } from "react";
import { Alert, Spinner } from "@inkjs/ui";
import { NewEntryDTO } from "../../domain/types/entries.js";
import { Tag } from "../../domain/types/tags.js";
import { useTabFocusManager } from "../hooks/useTabFocusManager.js";
import Form from "../components/Form/index.js";
import ScreenContainer from "../components/ScreenContainer.js";
import TextField from "../components/Form/TextField.js";
import dateBuilder, {
	addHours,
	formatDate,
	formatHours,
	getMinutesFromHours,
	minutesToHour,
	subtractHours,
} from "../utils/date.js";
import MultiSelectField from "../components/Form/MultiSelectField.js";
import { validateDate, validateHour } from "../utils/validation.js";
import { ServiceSubmissionResult } from "../../domain/types/services.js";
import { Box } from "ink";
import { getLastEntry } from "../../services/data/entries.js";
import useData from "../hooks/useData.js";
import useLoadingState from "../hooks/useLoadingState.js";
import useCommands from "../hooks/useCommands.js";

interface FormErrors {
	startingHour?: string;
	endingHour?: string;
	date?: string;
	description?: string;
}

interface SaveEntryTemplateProps {
	initialData?: NewEntryDTO;
	tags?: Tag[];
	onSubmit: (data: NewEntryDTO) => Promise<ServiceSubmissionResult>;
	isLoading?: boolean;
	isSubmitting?: boolean;
}

export default function SaveEntryTemplate({
	tags,
	initialData,
	onSubmit,
	isLoading,
	isSubmitting,
}: SaveEntryTemplateProps) {
	const [initialValues, setInitialValues] = useState({
		date: formatDate(dateBuilder()),
		endingHour: formatHours(dateBuilder()),
		tagIds: [],
		...initialData,
	});
	const [result, setResult] = useState<ServiceSubmissionResult>();

	const loadingState = useLoadingState({ lastEntry: true });

	const { refetch } = useData({
		fetcher: getLastEntry,
		onRequest: loadingState.getSetter("lastEntry", true),
		onFetch: (data) => {
			if (data) {
				setInitialValues((state) => {
					const startingHour = minutesToHour(
						addHours(data.endingHour, "00:01")
					);

					let endingHour = state.endingHour;

					if (
						getMinutesFromHours(state.endingHour) <
						getMinutesFromHours(startingHour)
					) {
						endingHour = "";
					}

					return {
						...state,
						startingHour,
						endingHour,
					};
				});
				loadingState.flip("lastEntry");
			}
		},
	});

	useEffect(() => {
		setInitialValues((state) => ({ ...state, ...initialData }));
	}, [initialData]);

	const { activeControl, reset } = useTabFocusManager(5);

	useCommands([
		{
			id: "next-field",
			key: "tab",
			description: "Próximo campo",
		},
		{
			id: "previous-field",
			key: "alt+tab",
			description: "Campo anterior",
		},
		{
			id: "save",
			key: "enter",
			description: "Salvar",
		},
	]);

	function handleSubmission(data: NewEntryDTO) {
		setInitialValues(data);

		onSubmit(data).then((result) => {
			setResult(result);

			if (result.status === "success") {
				refetch();

				setInitialValues({
					date: formatDate(dateBuilder()),
					endingHour: formatHours(dateBuilder()),
					tagIds: [],
					description: "",
					...initialData,
				});

				reset();
			}
		});
	}

	const title = initialData ? "ALTERAR APONTAMENTO" : "ADICIONAR APONTAMENTO";

	let content;

	if (isLoading || loadingState.value.lastEntry) {
		content = <Spinner label="Carregando dados..." />;
	} else if (isSubmitting) {
		content = <Spinner label="Salvando apontamento..." />;
	} else {
		content = (
			<Form<NewEntryDTO>
				onSubmit={handleSubmission}
				validate={validateForm}
				initialValues={initialValues}
			>
				<TextField
					name="date"
					label="Digite a data"
					isActive={activeControl === 0}
					placeholder={formatDate(dateBuilder())}
				/>

				<TextField
					name="startingHour"
					label="Digite a hora inicial"
					isActive={activeControl === 1}
					placeholder="00:00"
				/>

				<TextField
					name="endingHour"
					label="Digite a hora final"
					isActive={activeControl === 2}
					placeholder={formatHours(dateBuilder())}
				/>

				<TextField
					name="description"
					label="Descrição da entrada"
					placeholder="Hoje eu quebrei tudo"
					isActive={activeControl === 3}
				/>

				<MultiSelectField
					options={(tags || []).map((tag) => ({
						value: tag.id.toString(),
						label: tag.name,
					}))}
					name="tagIds"
					label="Tags"
					isActive={activeControl === 4}
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
			{result && (
				<Box width={result.message.length + 8}>
					<Alert variant={result.status}>{result.message}</Alert>
				</Box>
			)}
		</ScreenContainer>
	);
}

function validateForm(values: NewEntryDTO) {
	const { date, startingHour, endingHour, description } = values;

	const errors: FormErrors = {};

	errors.date = date ? validateDate(date) : "";
	errors.startingHour = startingHour
		? validateHour(startingHour)
		: "A hora inicial é obrigatória";
	errors.endingHour = endingHour ? validateHour(endingHour) : "";

	if (
		startingHour &&
		endingHour &&
		!errors.endingHour &&
		subtractHours(endingHour, startingHour) < 0
	) {
		errors.endingHour = "A hora final deve vir depois da hora inicial";
	}

	if (!description?.trim()) {
		errors.description = "Insira uma descrição para a entrada";
	}

	if (!Object.values(errors).filter(Boolean).length) {
		return undefined;
	}

	return errors;
}
