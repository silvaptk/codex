import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

interface Command {
	id: string;
	key: string;
	description: string;
}

interface CommandsState {
	commands: Command[];
	addCommands: (commandsToAdd: Command[]) => void;
	removeCommands: (commandsToRemove: Command[]) => void;
}

const CommandsContext = createContext<CommandsState>({
	commands: [],
	addCommands: () => {},
	removeCommands: () => {},
});

export const CommandsProvider = ({ children }: { children: ReactNode }) => {
	const [commands, setCommands] = useState<Command[]>([]);

	const addCommands = useCallback((newCommands: Command[]) => {
		setCommands((currentCommands) => {
			const ids = newCommands.map((command) => command.id);

			return currentCommands
				.filter((command) => !ids.includes(command.id))
				.concat(newCommands);
		});
	}, []);

	const removeCommands = useCallback((commandsToRemove: Command[]) => {
		setCommands((currentCommands) => {
			const ids = commandsToRemove.map((command) => command.id);

			return currentCommands.filter((command) => !ids.includes(command.id));
		});
	}, []);

	return (
		<CommandsContext.Provider value={{ commands, addCommands, removeCommands }}>
			{children}
		</CommandsContext.Provider>
	);
};

export default function useCommands(targetCommands: Command[]) {
	const { addCommands, removeCommands, commands } = useContext(CommandsContext);

	useEffect(() => {
		addCommands(targetCommands);

		return () => {
			removeCommands(targetCommands);
		};
	}, []);

	return { commands };
}

export function useDynamicCommands(targetCommands: Command[]) {
	const { addCommands, removeCommands, commands } = useContext(CommandsContext);

	useEffect(() => {
		addCommands(targetCommands);

		return () => {
			removeCommands(targetCommands);
		};
	}, [targetCommands]);

	return { commands };
}
