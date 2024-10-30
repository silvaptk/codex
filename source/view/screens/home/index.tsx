import React, { useMemo } from "react";
import { Box, Text } from "ink";
import { ScreenProps } from "../../types/screen.js";
import OptionsList from "../../components/OptionsList.js";
import ScreenContainer from "../../components/ScreenContainer.js";
import useData from "../../hooks/useData.js";
import { getEntriesOfTheDay } from "../../../services/data/entries.js";
import { minutesToHour, subtractHours } from "../../utils/date.js";

interface HomeScreenProps extends ScreenProps {}

export default function HomeScreen({ navigate }: HomeScreenProps) {
	const { data: todayEntries } = useData({ fetcher: getEntriesOfTheDay });

	const dayReport = useMemo(() => {
		if (!todayEntries) {
			return;
		}

		const report = {
			hoursDone: "00:00",
			entriesAmount: 0,
		};

		report.hoursDone = minutesToHour(
			todayEntries.reduce((result, entry) => {
				return result + subtractHours(entry.endingHour, entry.startingHour);
			}, 0)
		);
		report.entriesAmount = todayEntries.length;

		return report;
	}, [todayEntries]);

	return (
		<ScreenContainer>
			{!!dayReport && (
				<Box gap={4}>
					<Box flexDirection="column">
						<Text bold backgroundColor="white" color="black">
							Resumo
						</Text>
						<Text bold backgroundColor="white" color="black">
							do dia
						</Text>
					</Box>

					<Box flexDirection="column">
						<Text color="blue">Horas</Text>
						<Text>{dayReport.hoursDone}</Text>
					</Box>

					<Box flexDirection="column">
						<Text color="blue">Apontamentos</Text>
						<Text>{dayReport.entriesAmount}</Text>
					</Box>
				</Box>
			)}
			<Box>
				<OptionsList
					options={[
						{ label: "Adicionar apontamento", value: "add-entry" },
						{ label: "Ver relatórios", value: "reports" },
						{ label: "Ver apontamentos", value: "entries" },
						{ label: "Adicionar tags", value: "add-tag" },
						{ label: "Ver tags", value: "tags" },
						{ label: "Gerenciar dados", value: "manage-data" },
					]}
					onSelect={navigate}
				/>
			</Box>
		</ScreenContainer>
	);
}
