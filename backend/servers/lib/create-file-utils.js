const md5 = require('md5-file-promise');

function datafilePath(datafile) {
    let base = process.env.MCDIR;
    base = base.split(':')[0];
    if (!base.endsWith('/')) {
        base += '/';
    }

    let file_id = datafile.id;
    let part = file_id.split("-")[1];
    let partA = part.substring(0, 2);
    let partB = part.substring(2);
    let path = base + partA + "/" + partB + "/" + file_id;
    return path;
}

function mediaTypeDescriptionsFromMime(mime) {
    // if there is a semi-colen - strip media type of additional information
    let pos = mime.indexOf(';');
    if (pos > -1) {
        mime = mime.substring(pos-1)
    }
    let description = mediaTypeDescriptions[mime];
    if (!description) {
        description = mime
    }
    return {
        description:  description,
        mime:  mime,
    }
}

function computeChecksum(datafile) {
    let path = datafilePath(datafile);
    console.log("computeChecksum; path = ", path);
    return md5.computeFromFile(path);
}

const mediaTypeDescriptions = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":         "Spreadsheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":   "Word",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "Presentation",
    "Composite Document File V2 Document, No summary info":                      "Composite Document File",
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12":                "MS-PowerPoint",
    "text/xml":                                 "XML",
    "image/jpeg":                               "JPEG",
    "application/postscript":                   "Postscript",
    "image/png":                                "PNG",
    "application/json":                         "JSON",
    "image/vnd.ms-modi":                        "MS-Document Imaging",
    "application/vnd.ms-xpsdocument":           "MS-Postscript",
    "image/vnd.radiance":                       "Radiance",
    "application/vnd.sealedmedia.softseal.pdf": "Softseal PDF",
    "application/vnd.hp-PCL":                   "PCL",
    "application/xslt+xml":                     "XSLT",
    "image/gif":                                "GIF",
    "application/matlab":                       "Matlab",
    "application/pdf":                          "PDF",
    "application/xml":                          "XML",
    "application/vnd.ms-excel":                 "MS-Excel",
    "image/bmp":                                "BMP",
    "image/x-ms-bmp":                           "BMP",
    "image/tiff":                               "TIFF",
    "image/vnd.adobe.photoshop":                "Photoshop",
    "application/pkcs7-signature":              "PKCS",
    "image/vnd.dwg":                            "DWG",
    "application/octet-stream":                 "Binary",
    "application/rtf":                          "RTF",
    "text/plain":                               "Text",
    "application/vnd.ms-powerpoint":            "MS-PowerPoint",
    "application/x-troff-man":                  "TROFF",
    "video/x-ms-wmv":                           "WMV Video",
    "application/vnd.chemdraw+xml":             "ChemDraw",
    "text/html":                                "HTML",
    "video/mpeg":                               "MPEG Video",
    "text/csv":                                 "CSV",
    "application/zip":                          "ZIP",
    "application/msword":                       "MS-Word",
    "unknown":                                  "Unknown",
}

module.exports = {
    datafilePath,
    mediaTypeDescriptionsFromMime,
    computeChecksum
};