def getText(path, mediaType):
    (usecontent, content) = useBodyContent(path, mediaType)
    if usecontent:
        return content
    else:
        return ""

def getMediaType(path):
    return runTika("-d", path).rstrip()

def useBodyContent(path, mediaType):
    if mediaType == "text/plain":
        return containsSearchableContent(path)
    elif mediaType == "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        content = runTika("-t", path)
        return (True, content)
    else:
        return (False, "")

def containsSearchableContent(path):
    content = runTika("-t", path)
    countOfLinesWithAlphabetCharacters = 0
    lineCount = 0
    lines = content.split('\n')
    for line in lines:
        l = line.rstrip()
        if l:
            lineCount += 1
            if hasWords(l):
                countOfLinesWithAlphabetCharacters += 1
    percentage = float(countOfLinesWithAlphabetCharacters)/float(lineCount)
    return ((percentage > 0.6), content)

def hasWords(what):
    wordCount = 0
    charactersInARow = 0
    inWord = False
    for c in what:
        if c.isalpha():
            if not inWord:
                inWord = True
            charactersInARow += 1
        else:
            if inWord and charactersInARow >= 3:
                wordCount += 1
            inWord = False
            charactersInARow = 0
    return wordCount >= 2
