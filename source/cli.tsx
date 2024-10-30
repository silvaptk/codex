#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import App from "./view/app.js";
import setupDatabase from "./database/setup.js";

const enterAltScreenCommand = "\x1b[?1049h";
const leaveAltScreenCommand = "\x1b[?1049l";
process.stdout.write(enterAltScreenCommand);
process.on("exit", () => {
	process.stdout.write(leaveAltScreenCommand);
});

setupDatabase();

render(<App />);
