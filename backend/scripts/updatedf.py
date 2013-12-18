#!/usr/bin/env python

#import hashlib
import os

def main():
    for root, dirs, files in os.walk("/mcfs/data/materialscommons"):
        for f in files:
            print f

if __name__ == "__main__":
    main()
