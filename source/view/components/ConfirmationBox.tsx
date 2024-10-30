import { Spinner } from "@inkjs/ui";
import { Box, Text, useInput } from "ink";
import React, { ReactNode, useState } from "react";

interface ConfirmationBoxProps {
	isVisible: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	children?: ReactNode;
	isLoading?: boolean;
	loadingText?: string;
}

export default function ConfirmationBox({
	onCancel,
	onConfirm,
	isVisible,
	children,
	isLoading,
	loadingText
}: ConfirmationBoxProps) {
	const [activeOption, setActiveOption] = useState(0);

	useInput((input, key) => {
		if (!isVisible) {
			return;
		}
		if (key.leftArrow || key.rightArrow) {
			setActiveOption((state) => (state ? 0 : 1));
		}

		if (key.return || input === " ") {
			if (activeOption) {
				onCancel();
			} else {
				onConfirm();
			}
		}
	});

	if (!isVisible) {
		return null;
	}

	return (
		<Box
			flexDirection="column"
			gap={1}
			borderStyle="single"
			borderRight={false}
			borderBottom={false}
			borderTop={false}
			paddingX={4}
			paddingY={1}
		>
			{children}

			{!isLoading && (
				<Box gap={4}>
					<Option isActive={activeOption === 0} text="Sim" />
					<Option isActive={activeOption === 1} text="Não" />
				</Box>
			)}
			{isLoading && (
				<Spinner label={loadingText || "Processando..."} />
			)}
		</Box>
	);
}

interface OptionProps {
	isActive?: boolean;
	text: string;
}

function Option({ isActive, text }: OptionProps) {
	return (
		<Text
			color={isActive ? "black" : "white"}
			bold={isActive}
			backgroundColor={isActive ? "blue" : undefined}
		>
			{"  "}
			{text}
			{"  "}
		</Text>
	);
}
