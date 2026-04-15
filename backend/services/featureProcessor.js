const featureList = require("../config/featureList");

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildLookup(rawPacket = {}) {
  return Object.entries(rawPacket).reduce((lookup, [key, value]) => {
    lookup[normalizeKey(key)] = value;
    return lookup;
  }, {});
}

function process(rawPacket = {}, options = {}) {
  const lookup = buildLookup(rawPacket);
  const processedData = featureList.map((featureName) => {
    const normalizedFeatureName = normalizeKey(featureName);
    return toNumber(lookup[normalizedFeatureName]);
  });

  return {
    source: options.source || "manual",
    featureNames: featureList,
    processedData,
    missingFields: featureList.filter((featureName) => {
      const normalizedFeatureName = normalizeKey(featureName);
      return !(normalizedFeatureName in lookup);
    })
  };
}

module.exports = { process };
