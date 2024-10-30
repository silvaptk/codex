import figlet from "figlet";
import { Box, Text, useInput } from "ink";
import React, { ComponentProps } from "react";
import useRouter from "../router.js";
import useCommands from "../hooks/useCommands.js";

type ScreenContainerProps = ComponentProps<typeof Box> & {
	instructions?: string;
	title?: string;
};

export default function ScreenContainer(props: ScreenContainerProps) {
	const propsWithoutChildren = { ...props, children: undefined };

	const { navigate } = useRouter();

	const { commands } = useCommands([
		{
			id: "home",
			key: "esc",
			description: "Início",
		},
	]);

	useInput((_, key) => {
		if (key.escape) {
			navigate("home");
		}
	});

	return (
		<Box flexDirection="column" gap={1} {...propsWithoutChildren}>
			<Text color="blue">{figlet.textSync("Codex", "Univers")}</Text>

			{propsWithoutChildren.title && (
				<Text color="black" backgroundColor="white" bold>
					{"  "}
					{propsWithoutChildren.title}
					{"  "}
				</Text>
			)}

			{!!commands.length && (
				<Box gap={4}>
					{commands.map(command => (
						<Box key={command.id} gap={1}>
							<Text backgroundColor="gray" color="black" bold>[{command.key.toUpperCase()}]</Text>
							<Text>{command.description}</Text>
						</Box>
					))}
				</Box>
			)}

			{props.children}
		</Box>
	);
}
