import React, { useMemo } from "react";
import { Field } from "react-final-form";
import FieldWrapper from "./FieldWrapper.js";
import { MultiSelect } from "@inkjs/ui";
import { useDynamicCommands } from "../../hooks/useCommands.js";

interface MultiSelectFieldProps {
	name: string;
	isActive: boolean;
	label: string;
	options: { value: string; label: string }[];
}

export default function MultiSelectField({
	name,
	isActive,
	label,
	options,
}: MultiSelectFieldProps) {
	const commands = useMemo(() => {
		if (isActive) {
			return [
				{
					id: "move",
					key: "cima/baixo",
					description: "Opções: Navegar"
				},
				{
					id: "select",
					key: "espaço",
					description: "Opções: Selecionar/Remover"
				},
			]
		}

		return []
	}, [isActive])

	useDynamicCommands(commands)
	return (
		<Field name={name}>
			{({ input, meta }) => (
				<FieldWrapper
					isActive={isActive}
					label={label}
					onFocus={input.onFocus}
					onBlur={input.onBlur}
					{...meta}
				>
					<MultiSelect
						{...input}
						options={options}
						isDisabled={!isActive}
						defaultValue={input.value}
					/>
				</FieldWrapper>
			)}
		</Field>
	);
}
