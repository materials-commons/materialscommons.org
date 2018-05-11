import os
import logging
from werkzeug.utils import secure_filename
from flask import request
from flask_api import status

ALLOWED_EXTENSIONS = {'xlsx'}


class UploadUtility:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("Starting UploadUtility")

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def get_file(self):
        # noinspection PyUnusedLocal
        try:
            self.log.info("Starting get_file")
            upload_folder = self.get_tmp_upload_dir()
            self.log.info("upload_folder = {}".format(upload_folder))
            if not os.path.exists(upload_folder):
                message = "etl file upload - no upload folder: " + upload_folder
                self.log.info(message)
                return message, status.HTTP_503_SERVICE_UNAVAILABLE
            # check if the post request has the file part
            if 'file' not in request.files:
                message = "etl file upload - no file"
                self.log.info(message)
                return message, status.HTTP_400_BAD_REQUEST
            file = request.files['file']
            # if user does not select file, browser also
            # submits a empty part without filename
            if file.filename == '':
                message = "etl file upload - empty file"
                self.log.info(message)
                return message, status.HTTP_400_BAD_REQUEST
            name = request.form.get('name')
            project_id = request.form.get("project_id")
            description = request.form.get("description")
            self.log.info("etl file upload - request data")
            self.log.info(name)
            self.log.info(project_id)
            self.log.info(description)
            if not name:
                message = "etl file upload - experiment name missing, required"
                self.log.info(message)
                return message, status.HTTP_400_BAD_REQUEST
            if not project_id:
                message = "etl file upload - project_id missing, required"
                self.log.info(message)
                return message, status.HTTP_400_BAD_REQUEST
            if not self.allowed_file(file.filename):
                message = "etl file upload - wrong file extension, must be '*.xlsx'"
                message += ": " + file.filename
                self.log.info("etl file upload - file accepted")
            filename = secure_filename(file.filename)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            self.log.info("etl file upload - done")
            return file_path, None
        except Exception as e:
            self.log.info("Unexpected exception...", exc_info=True)
            message = str(e)
            return message, status.HTTP_500_INTERNAL_SERVER_ERROR

    def get_tmp_upload_dir(self):
        base = os.environ['MCDIR']
        upload_dir = base.split(':')[0]
        self.log.info("MCDIR = {}".format(upload_dir))
        return upload_dir
