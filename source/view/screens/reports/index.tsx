import React, { useEffect, useMemo, useState } from "react";
import { Box, Text } from "ink";

import { ScreenProps } from "../../types/screen.js";
import OptionsList from "../../components/OptionsList.js";
import { formatMonth } from "../../utils/date.js";
import { formatAsCurrency } from "../../utils/misc.js";
import ScreenContainer from "../../components/ScreenContainer.js";
import useData from "../../hooks/useData.js";
import { getEntryMonthlyReports } from "../../../services/data/entries.js";
import { getHoursGoal, getHourValue } from "../../../services/data/user.js";
import { parseMonthlyEntryReport } from "./utils.js";
import { Spinner } from "@inkjs/ui";

interface ReportsScreenProps extends ScreenProps {}

export default function ReportsScreen({}: ReportsScreenProps) {
	const { data: entryMonthlyReports } = useData({
		fetcher: getEntryMonthlyReports,
	});
	const { data: hoursGoal } = useData({ fetcher: getHoursGoal });
	const { data: hourValue } = useData({ fetcher: getHourValue });

	const months = useMemo(() => {
		if (!entryMonthlyReports) {
			return [];
		}

		return entryMonthlyReports.map((data) => ({
			value: data.month,
			label: formatMonth(data.month),
		}));
	}, [entryMonthlyReports]);

	const [activeMonth, setActiveMonth] = useState(months[0]?.value);

	const parsedData = useMemo(() => {
		if (!entryMonthlyReports || !hoursGoal || !hourValue) {
			return [];
		}

		return entryMonthlyReports.map((item) => {
			return parseMonthlyEntryReport(item, hourValue, hoursGoal);
		});
	}, [entryMonthlyReports, hoursGoal, hourValue]);

	const activeReport = useMemo(() => {
		return parsedData.find((entry) => entry.month === activeMonth);
	}, [activeMonth, parsedData]);

	useEffect(() => {
		if (months[0]) {
			setActiveMonth(months[0]?.value);
		}
	}, [months]);

	let content;

	if (entryMonthlyReports && hoursGoal && hourValue) {
		content = (
			<Box gap={4}>
				<OptionsList
					options={months}
					onChange={setActiveMonth}
					maxLength={5}
					minWidth={15}
				/>

				{activeReport && (
					<Box gap={1} flexDirection="column">
						<Box gap={4}>
							<ReportItem
								label="Dias trabalhados"
								value={`${activeReport.days.done} dias`}
							/>
							<ReportItem
								label="Dias restantes"
								value={`${activeReport.days.remaining} dias`}
							/>
							<ReportItem
								label="Dias totais"
								value={`${activeReport.days.total} dias`}
							/>
						</Box>

						<Box gap={4}>
							<ReportItem
								label="Horas realizadas"
								value={`${activeReport.hours.done} horas`}
							/>
							<ReportItem
								label="Horas restantes"
								value={`${activeReport.hours.remaining} horas`}
							/>
							<ReportItem
								label="Meta"
								value={`${activeReport.hours.goal} horas`}
							/>
							<ReportItem
								label="Média"
								value={`${activeReport.hours.mean} por dia`}
							/>
							<ReportItem
								label="Média necessária"
								value={`${activeReport.hours.goalMean} por dia`}
							/>
						</Box>

						<Box gap={4}>
							<ReportItem
								label="Valor acumulado"
								value={`R$ ${formatAsCurrency(activeReport.money.accumulated)}`}
							/>
							<ReportItem
								label="Valor de meta"
								value={`R$ ${formatAsCurrency(activeReport.money.goal)}`}
							/>
							<ReportItem
								label="Valor médio"
								value={`R$ ${formatAsCurrency(activeReport.money.mean)}`}
							/>
						</Box>
					</Box>
				)}
			</Box>
		);
	} else {
		content = <Spinner label="Carregando dados..." />;
	}

	return (
		<ScreenContainer
			title="RELATÓRIOS"
			instructions="Utilize as SETAS para navegar entre os meses. Pressione ESC para voltar"
		>
			{content}
		</ScreenContainer>
	);
}

interface ReportItemProps {
	label: string;
	value: string;
}

function ReportItem({ label, value }: ReportItemProps) {
	return (
		<Box flexDirection="column">
			<Text backgroundColor="white" color="black">
				{label}
			</Text>
			<Text>{value}</Text>
		</Box>
	);
}
