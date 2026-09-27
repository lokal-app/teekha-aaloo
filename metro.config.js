const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('lottie', 'riv');

// axios: force the browser build so Metro never resolves the Node adapter (http/crypto).
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest ?? context.resolveRequest;
  if (moduleName === 'axios') {
    return resolve(
      { ...context, unstable_conditionNames: ['browser', 'require', 'react-native'] },
      moduleName,
      platform,
    );
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
