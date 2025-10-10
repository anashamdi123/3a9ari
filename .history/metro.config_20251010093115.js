const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Filter out frames with invalid file paths like "<anonymous>" to prevent codeframe reads
config.symbolicator = {
	customizeStack(frames) {
		const filtered = frames.filter((f) => f.file && !f.file.includes('<anonymous>'));
		return { stack: filtered };
	},
};

module.exports = config;


