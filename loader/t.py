#!/usr/bin/env python
import git

def mixed_iterator(index):
    count = 0
    for entry in index.entries.itervalues():
        print type_id
        if type_id == 0:
            yield entry.path
        elif type_id == 1:
            yield git.Blob(repo, entry.binsha, entry.mode, entry.path)
        elif type_id == 2:
            yield git.BaseIndexEntry(entry[:4])
        elif type_id == 3:
            yield entry
        else:
            raise AssertionError("Invalid Type")
        count += 1

repo = git.Repo(".")
index = repo.index
deleted_files = index.remove(mixed_iterator(index), working_tree=False)
print len(deleted_files)
