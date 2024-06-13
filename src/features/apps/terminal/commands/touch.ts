import { VirtualFile } from "../../../virtual-drive/file";
import { formatError } from "../_utils/terminal.utils";
import Command from "../command";

export const touch = new Command()
	.setRequireArgs(true)
	.setManual({
		purpose: "Change file timestamps",
		usage: "touch [options] files",
		description: "Update the access and modification times of each FILE to the current time.\n\n"
			+ "A file argument that does not exist is created empty."
	})
	.setExecute(function(args, { currentDirectory }) {
		if (args[0] === "girls\\" && args[1] === "boo**")
			return formatError((this as Command).name, "Cannot touch 'girls boo**': Permission denied");
	
		const { name, extension } = VirtualFile.convertId(args[0]);
	
		if (currentDirectory.findFile(name, extension))
			return { blank: true };
	
		currentDirectory.createFile(name, extension);
		return { blank: true };
	});