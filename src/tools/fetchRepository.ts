import fs from "node:fs";
import { ANSI } from "../config/apps/terminal.config";

const API_URL = "https://api.github.com/";
const TREE_PATH = "public/config/tree.json";

// TO DO: split these two variables into their own file
const OWNER = "OS";
const REPO = "OS";

const BRANCH = "main";

interface ReponseType {
	sha: string;
	url: string;
	tree: {
		path: string;
		mode: string;
		type: string;
		sha: string;
		url: string;
	}[];
	truncated: boolean;
}

function fetchRepositoryTree(callback: (tree: string) => void) {
	const treeUrl = `${API_URL}repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=true`;

	console.log(`${ANSI.fg.yellow}Fetching: ${ANSI.fg.cyan + treeUrl + ANSI.reset}`);

	void fetch(treeUrl).then((response) =>
		response.json()
	).then((response: ReponseType) => {
		const items = response.tree;

		const files = [];
		const folders = [];

		items.forEach(({ path, type }) => {
			if (type === "tree") {
				folders.push(path);
			} else {
				files.push(path);
			}
		});

		console.log(`Files found: ${ANSI.fg.cyan + files.length + ANSI.reset}`);
		console.log(`Folders found: ${ANSI.fg.cyan + folders.length + ANSI.reset}`);
		console.log(`Truncated: ${ANSI.fg.cyan + response.truncated.toString() + ANSI.reset}`);

		const tree = JSON.stringify({ files, folders });
		callback(tree);
	}).catch((error) => {
		console.error(error);
	});
}

try {
	fetchRepositoryTree((tree) => {
		fs.writeFileSync(TREE_PATH, tree, { flag: "w+" });
		console.log(`\n${ANSI.fg.green}✓ Generated repository tree: ${ANSI.fg.cyan + TREE_PATH + ANSI.reset}`);
	});
} catch (error) {
	console.error(error);
}