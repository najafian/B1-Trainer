// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite ships its web build as WebAssembly (wa-sqlite). Metro must treat
// .wasm as an asset or the web bundle fails to resolve it.
// https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/#web-setup
config.resolver.assetExts.push('wasm');

module.exports = config;
