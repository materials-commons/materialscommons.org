function isOfficeDoc(mime) {
    return (mime === 'application/vnd.ms-excel') ||
        (mime === 'application/vnd.ms-powerpoint') ||
        (mime === 'application/msword') ||
        (mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') ||
        (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
        (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

function isConvertedImage(mime) {
    switch (mime) {
        case 'image/tiff':
            return true;
        case 'image/x-ms-bmp':
            return true;
        case 'image/bmp':
            return true;
        default:
            return false;
    }
}

function mediaTypeDescriptionsFromMime(mime) {
    // if there is a semi-colon - strip media type of additional information
    let pos = mime.indexOf(';');
    if (pos > -1) {
        mime = mime.substring(pos - 1);
    }
    let description = mediaTypeDescriptions[mime];
    if (!description) {
        description = mediaTypeDescriptions['unknown'];
    }
    return {
        description: description,
        mime: mime,
    };
}

const mediaTypeDescriptions = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Spreadsheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Presentation',
    'Composite Document File V2 Document, No summary info': 'Composite Document File',
    'application/vnd.ms-powerpoint.presentation.macroEnabled.12': 'MS-PowerPoint',
    'text/xml': 'XML',
    'image/jpeg': 'JPEG',
    'application/postscript': 'Postscript',
    'image/png': 'PNG',
    'application/json': 'JSON',
    'image/vnd.ms-modi': 'MS-Document Imaging',
    'application/vnd.ms-xpsdocument': 'MS-Postscript',
    'image/vnd.radiance': 'Radiance',
    'application/vnd.sealedmedia.softseal.pdf': 'Softseal PDF',
    'application/vnd.hp-PCL': 'PCL',
    'application/xslt+xml': 'XSLT',
    'image/gif': 'GIF',
    'application/matlab': 'Matlab',
    'application/pdf': 'PDF',
    'application/xml': 'XML',
    'application/vnd.ms-excel': 'MS-Excel',
    'image/bmp': 'BMP',
    'image/x-ms-bmp': 'BMP',
    'image/tiff': 'TIFF',
    'image/vnd.adobe.photoshop': 'Photoshop',
    'application/pkcs7-signature': 'PKCS',
    'image/vnd.dwg': 'DWG',
    'application/octet-stream': 'Binary',
    'application/rtf': 'RTF',
    'text/plain': 'Text',
    'application/vnd.ms-powerpoint': 'MS-PowerPoint',
    'application/x-troff-man': 'TROFF',
    'video/x-ms-wmv': 'WMV Video',
    'application/vnd.chemdraw+xml': 'ChemDraw',
    'text/html': 'HTML',
    'video/mpeg': 'MPEG Video',
    'text/csv': 'CSV',
    'application/zip': 'ZIP',
    'application/msword': 'MS-Word',
    'unknown': 'Unknown',
};

module.exports = {
    isOfficeDoc,
    isConvertedImage,
    mediaTypeDescriptionsFromMime
};