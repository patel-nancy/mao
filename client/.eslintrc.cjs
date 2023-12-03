module.exports = {
	root: true,
	parserOptions: {
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	env: { jest: true, browser: true, es2020: true, node: true, amd: true },
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
		"plugin:prettier/recommended",
	],
	ignorePatterns: ["dist", ".eslintrc.cjs"],
	parserOptions: { ecmaVersion: "latest", sourceType: "module" },
	settings: { react: { version: "18.2" } },
	plugins: ["react-refresh"],
	rules: {
		"react-refresh/only-export-components": [
			"warn",
			{ allowConstantExport: true },
		],
		"no-unused-vars": [
			"error",
			{ vars: "all", args: "after-used", ignoreRestSiblings: false },
		],
		"prettier/prettier": ["error", {}, { usePrettierrc: true }],
	},
};
