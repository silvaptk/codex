import fileSystem from "fs";
import { User } from "../../domain/types/user.js";

const DEFAULT_USER_DATA = {
	hourValue: 38,
	hoursGoal: 160,
};

export async function getUserData(): Promise<User> {
	if (!fileSystem.existsSync("user.json")) {
		fileSystem.writeFileSync("user.json", JSON.stringify(DEFAULT_USER_DATA));
		
		return DEFAULT_USER_DATA;
	}

	const content = fileSystem.readFileSync("user.json").toString();

	return content ? JSON.parse(content) : DEFAULT_USER_DATA;
}

export async function updateUserData(data: Partial<User>) {
	const updatedUserData = { ...getUserData(), ...data };

	fileSystem.writeFileSync("user.json", JSON.stringify(updatedUserData));
}

export async function getHourValue() {
	const userData = await getUserData();

	return userData.hourValue;
}

export async function getHoursGoal() {
	const userData = await getUserData();

	return userData.hoursGoal;
}
