const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Collapse frames with invalid file paths like "<anonymous>" to avoid codeframe lookups
config.symbolicator = {
	customizeFrame(frame) {
		if (!frame.file || frame.file.includes('<anonymous>')) return { collapse: true };
		return {};
	},
};

module.exports = config;


