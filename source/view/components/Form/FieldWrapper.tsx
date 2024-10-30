import { Box, Text } from "ink";
import React, { ReactNode, useEffect } from "react";

interface FieldWrapperProps extends ErrorMessageProps {
	label: string;
	children: ReactNode;
	isActive: boolean;
	inColumn?: boolean;
	onFocus: () => void;
	onBlur: () => void;
}

export default function FieldWrapper({
	label,
	children,
	isActive,
	inColumn,
	onFocus,
	onBlur,
	...errorProps
}: FieldWrapperProps) {
	useEffect(() => {
		if (isActive) {
			onFocus();

			return onBlur;
		}

		return undefined;
	}, [isActive]);

	return (
		<Box flexDirection="column">
			<Box
				gap={inColumn ? 0 : 1}
				flexDirection={inColumn ? "column" : "row"}
			>
				<Text bold={isActive}>
					{isActive ? (
						"❯ "
					) : errorProps.error && errorProps.touched ? (
						<Text color="red">⨉ </Text>
					) : errorProps.valid ? (
						<Text color="green">✓ </Text>
					) : (
						<Text color="blue">? </Text>
					)}
					{label}
				</Text>
				{children}
			</Box>
			<ErrorMessage {...errorProps} />
		</Box>
	);
}

interface ErrorMessageProps {
	error?: string;
	touched?: boolean;
	valid?: boolean;
}

function ErrorMessage({ error, touched }: ErrorMessageProps) {
	if (!error || !touched) return null;

	return (
		<Text color="red">
			{"  "}
			{error}
		</Text>
	);
}
