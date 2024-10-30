import React from "react";
import { Field } from "react-final-form";
import FieldWrapper from "./FieldWrapper.js";
import { TextInput } from "@inkjs/ui";

interface TextFieldProps {
	name: string;
	isActive: boolean;
	label: string;
	placeholder?: string;
	inColumn?: boolean;
}

export default function TextField({
	name,
	isActive,
	label,
	placeholder,
	inColumn,
}: TextFieldProps) {
	return (
		<Field name={name}>
			{({ input, meta }) => (
				<FieldWrapper
					isActive={isActive}
					label={label}
					onFocus={input.onFocus}
					onBlur={input.onBlur}
					inColumn={inColumn}
					{...meta}
				>
					<TextInput
						{...input}
						defaultValue={input.value}
						isDisabled={!isActive}
						placeholder={placeholder}
					/>
				</FieldWrapper>
			)}
		</Field>
	);
}
