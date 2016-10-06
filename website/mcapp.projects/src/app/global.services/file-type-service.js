/*@ngInject*/
export function fileTypeService(isImage) {
    'ngInject';

    var self = this;

    function OverviewEntry(icon, name) {
        this.count = 1;
        this.files = [];
        this.icon = icon;
        this.name = name;
    }

    function addEntry(to, f, name) {
        var entry, icon;
        if (!(name in to)) {
            icon = self.service.icon(f);
            entry = new OverviewEntry(icon, name);
            entry.files.push(f);
            to[name] = entry;
        } else {
            entry = to[name];
            entry.count++;
            entry.files.push(f);
        }
    }

    self.service = {
        icon: function(f) {
            var fileIcon = "fa-file-o";
            if (f._type === "directory") {
                return "fa-folder-open";
            }

            if (!f.mediatype || !f.mediatype.mime) {
                return fileIcon;
            }

            switch (f.mediatype.mime) {
            case "application/pdf":
                fileIcon = "fa-file-pdf-o";
                break;
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                fileIcon = "fa-file-excel-o";
                break;
            case "application/vnd.ms-excel":
                fileIcon = "fa-file-excel-o";
                break;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                fileIcon = "fa-file-word-o";
                break;
            case "application/ms-word":
                fileIcon = "fa-file-word-o";
                break;
            case "application/vnd.ms-powerpoint.presentation.macroEnabled.12":
                fileIcon = "fa-file-powerpoint-o";
                break;
            case "application/vnd.ms-powerpoint":
                fileIcon = "fa-file-powerpoint-o";
                break;
            default:
                if (isImage(f.mediatype.mime)) {
                    fileIcon = "fa-file-image-o";
                }
                break;
            }

            return fileIcon;
        },

        overview: function(files) {
            var overviewHash = [];
            for (var i = 0; i < files.length; i++) {
                if (files[i].data._type === "directory") {
                    addEntry(overviewHash, files[i].data, "Directory");
                } else {
                    addEntry(overviewHash, files[i].data, files[i].data.mediatype.description);
                }
            }
            return overviewHash;
        }
    };

    return self.service;
}
