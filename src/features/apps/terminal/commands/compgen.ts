import Command from "../command";
import CommandsManager from "../commands";

export const compgen = new Command()
	.setManual({
		purpose: "Display a list of all commands"
	})
	.setRequireOptions(true)
	.setExecute(function(args, { options }) {
		if (options.includes("c")) {
			return CommandsManager.COMMANDS.map((command) => command.name).sort().join("\n");
		}
	});