#!/usr/bin/env python

from __future__ import print_function

import json
import shutil

EXTENSION_DIR = 'extension'
DIST_DIR = 'dist'


def extract_extension_data():
    with open(EXTENSION_DIR + '/manifest.json') as content:
        content_json = json.load(content)
        name = content_json.get('name')
        extension_version = content_json.get('version')

    return [name, extension_version]


def main():
    [name, version] = extract_extension_data()
    zip_name = '{}/{}-{}'.format(DIST_DIR, name, version)

    print('Building {}.zip'.format(zip_name))
    try:
        shutil.make_archive(zip_name, 'zip', EXTENSION_DIR)
        print('Ok')
    except Exception as e:
        raise e


if __name__ == '__main__':
    main()