import { Box, Text, useInput } from "ink";
import React, { useEffect, useMemo, useState } from "react";
import { useDynamicCommands } from "../hooks/useCommands.js";

type Option = { label: string; value: string };

interface OptionsListProps {
	options: Option[];
	onSelect?: (value: string) => void;
	onChange?: (value: string) => void;
	maxLength?: number;
	minWidth?: number;
	isDisabled?: boolean;
}

export default function OptionsList({
	options,
	onSelect,
	onChange,
	maxLength,
	minWidth,
	isDisabled,
}: OptionsListProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [lastMove, setLastMove] = useState<"UP" | "DOWN">("UP");

	const isSelectable = !!onSelect;

	const commands = useMemo(() => {
		const commands = [];

		if (!isDisabled) {
			commands.push({
				id: "move",
				key: "cima/baixo",
				description: "Opções: Mover",
			});

			if (isSelectable) {
				commands.push({
					id: "select",
					key: "enter/espaço",
					description: "Opções: Selecionar",
				});
			}
		}
		
		return commands;
	}, [isDisabled, isSelectable]);

	useDynamicCommands(commands);

	const getOptionStyles = (option: Option) => {
		const index = options.findIndex((item) => item.value === option.value);

		if (index === activeIndex) {
			return {
				color: "black",
				backgroundColor: isDisabled ? "gray" : "blue",
			};
		}

		return {};
	};

	useEffect(() => {
		if (!onChange) {
			return;
		}

		const activeOption = options[activeIndex];

		if (!activeOption) {
			return;
		}

		onChange(activeOption.value);
	}, [options, activeIndex]);

	useInput((input, key) => {
		if (isDisabled) {
			return;
		}

		if (key.downArrow) {
			setLastMove("DOWN");
			setActiveIndex((index) => (index + 1) % options.length);
			return;
		}

		if (key.upArrow) {
			setLastMove("UP");
			setActiveIndex((index) => {
				if (index === 0) {
					return options.length - 1;
				}

				return index - 1;
			});

			return;
		}

		if (key.return || input === " ") {
			const targetOption = options[activeIndex];

			if (targetOption) {
				onSelect?.(targetOption.value);
			}
		}
	});

	const visibleOptions = useMemo(() => {
		if (!maxLength || maxLength >= options.length) {
			return options;
		}

		return options.slice(
			Math.max(
				0,
				Math.min(
					activeIndex - Math.floor(maxLength / 2),
					options.length - maxLength
				)
			),
			Math.min(
				options.length,
				Math.max(maxLength, activeIndex + Math.ceil(maxLength / 2))
			)
		);
	}, [activeIndex, options, lastMove, maxLength]);

	function getOptionPrefix(targetOption: Option) {
		if (!maxLength || maxLength >= options.length) {
			return "";
		}

		const visibleIndex = visibleOptions.findIndex(
			(option) => option.value === targetOption.value
		);

		const optionIsTheLastVisible = visibleIndex === visibleOptions.length - 1;
		const optionIsTheFirstVisible = visibleIndex === 0;

		const visibleOptionsAreSuffix =
			visibleOptions.at(-1)?.value === options.at(-1)?.value;
		const visibleOptionsArePrefix =
			visibleOptions.at(0)?.value === options.at(0)?.value;

		if (optionIsTheFirstVisible && !visibleOptionsArePrefix) {
			return "⌃ ";
		}

		if (optionIsTheLastVisible && !visibleOptionsAreSuffix) {
			return "⌄ ";
		}

		return "  ";
	}

	return (
		<Box flexDirection="column">
			{visibleOptions.map((option) => (
				<Text key={option.value} {...getOptionStyles(option)}>
					{String(getOptionPrefix(option) + option.label).padEnd(minWidth || 0)}
				</Text>
			))}
		</Box>
	);
}
