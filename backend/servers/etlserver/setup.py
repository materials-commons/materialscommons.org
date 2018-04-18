from setuptools import setup, find_packages

setup(
    name='etlserver',
    version='0.1.0',
    packages = find_packages(),
    install_requires = [
        'materials_commons',
        'configparser',
        'flask-api',
        'faktory',
        'rethinkdb',
        'argparse',
        'six',
        'xlsxwriter',
        'openpyxl',
        'globus_sdk'],
)
