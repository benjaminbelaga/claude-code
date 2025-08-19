const IMAGE_BASE_URL = 'https://yydistribution.ams3.digitaloceanspaces.com/yyplayer/images/';

function findFirstAvailableImage(sku) {
  if (!sku || sku.trim() === '') {
    return 'SKU is empty';
  }

  const nameVariations = ['_1_600', '_2_600', '_a', '_b', ''];
  const extensions = ['.jpg', '.jpeg', '.png', '.webp'];

  for (let i = 0; i < extensions.length; i++) {
    for (let j = 0; j < nameVariations.length; j++) {
      const extension = extensions[i];
      const variation = nameVariations[j];
      
      const url = IMAGE_BASE_URL + sku + variation + extension;
      
      const statusCode = getHttpStatusCode(url);
      
      if (statusCode === 200) {
        const variationName = variation === '' ? 'none' : variation;
        const extensionName = extension.slice(1);
        return 'Working (' + extensionName + ', ' + variationName + ')';
      }
    }
  }

  return 'NO (Not Found)';
}

function getHttpStatusCode(url) {
  try {
    const options = {
      'muteHttpExceptions': true,
      'method' : 'GET'
    };
    const response = UrlFetchApp.fetch(url, options);
    return response.getResponseCode();
  } catch (e) {
    Logger.log('Network error fetching URL ' + url + ': ' + e.message);
    return -1;
  }
}