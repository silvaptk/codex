import { Box, Text, useInput } from "ink";
import React, { useEffect, useMemo, useState } from "react";

export interface Option {
	value: string;
	label: string;
}

interface HorizontalOptionListProps {
	options: Option[];
	maxLength?: number;
	onChange: (selectedOptions: Option[]) => void;
	isDisabled?: boolean;
	multiple?: boolean;
}

export default function HorizontalOptionList({
	options,
	maxLength,
	onChange,
	isDisabled,
	multiple,
}: HorizontalOptionListProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

	useInput((input, key) => {
		if (isDisabled) {
			return;
		}

		if (key.leftArrow) {
			setActiveIndex((state) => (state === 0 ? options.length - 1 : state - 1));
		}

		if (key.rightArrow) {
			setActiveIndex((state) => (state + 1) % options.length);
		}

		if (input === " ") {
			if (multiple) {
				setSelectedIndices((state) => {
					if (state.includes(activeIndex)) {
						return state.filter((index) => index !== activeIndex);
					}
					return [...state, activeIndex];
				});
			} else {
				setSelectedIndices((state) =>
					state[0] === activeIndex ? [] : [activeIndex]
				);
			}
		}
	});

	const visibleOptions = useMemo(() => {
		if (!maxLength) {
			return options;
		}

		if (activeIndex < Math.floor(maxLength / 2)) {
			return options.slice(0, 4);
		}

		if (activeIndex > options.length - maxLength) {
			return options.slice(-maxLength);
		}

		return options.slice(
			activeIndex - Math.floor(maxLength / 2),
			activeIndex + Math.ceil(maxLength / 2)
		);
	}, [activeIndex]);

	useEffect(() => {
		onChange(
			selectedIndices
				.map((index) => options[index])
				.filter((option) => !!option)
		);
	}, [selectedIndices]);

	return (
		<Box gap={2}>
			{options[0]?.value !== visibleOptions[0]?.value && <Text>◀</Text>}

			{visibleOptions.map((option, index) => {
				const sourceIndex = options.findIndex(
					(item) => item.value === option.value
				);

				return (
					<Box key={option.value}>
						{index ? <Text>|&nbsp;&nbsp;</Text> : null}

						<Text
							backgroundColor={
								activeIndex === sourceIndex
									? isDisabled
										? "gray"
										: "blue"
									: undefined
							}
							color={
								activeIndex === sourceIndex
									? "black"
									: selectedIndices.includes(sourceIndex)
									? "blue"
									: "white"
							}
						>
							{option.label}
						</Text>
					</Box>
				);
			})}
			{options.at(-1)?.value !== visibleOptions.at(-1)?.value && <Text>▶</Text>}
		</Box>
	);
}
