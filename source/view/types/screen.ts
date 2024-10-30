export type ScreenParams = Record<string, string | number>;

export interface ScreenProps<T extends {} = {}> {
	navigate: (newScreen: string, params?: ScreenParams) => void;
	params: Partial<T>;
}

