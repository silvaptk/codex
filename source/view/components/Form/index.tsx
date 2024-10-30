import { Box, useInput } from "ink";
import React, { ReactNode } from "react";
import { Form as RFFForm } from "react-final-form";

interface FormProps<T> {
	onSubmit: (values: T) => void;
	initialValues?: Partial<T>;
	validate: (values: T) => { [key in keyof T]?: string } | undefined;
	children?: ReactNode;
}

export default function Form<T>({
	onSubmit,
	initialValues,
	validate,
	children,
}: FormProps<T>) {
	return (
		<RFFForm
			onSubmit={onSubmit}
			initialValues={initialValues}
			validate={validate}
		>
			{({ handleSubmit }) => (
				<Box flexDirection="column">
					{children}

					<HandleEnter callback={handleSubmit} />
				</Box>
			)}
		</RFFForm>
	);
}

function HandleEnter({ callback }: { callback: () => void }) {
	useInput((_, key) => {
		if (key.return) {
			callback();
		}
	});

	return null;
}
