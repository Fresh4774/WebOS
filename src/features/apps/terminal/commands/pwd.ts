import Command from "../command";

export const pwd = new Command()
	.setManual({
		purpose: "Display path of the current directory"
	})
	.setExecute(function(args, { currentDirectory }) {
		if (currentDirectory.root) {
			return "/";
		} else {
			return currentDirectory.absolutePath;
		}
	});