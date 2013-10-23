#!/bin/sh

BASEDIR=$1
COMMAND="metaloader.py"
ECHO=""

$ECHO $COMMAND virn@umich.edu allisonlab "$BASEDIR/6111_Aluminum_Alloys"
$ECHO $COMMAND miaojias@umich.edu allisonlab "$BASEDIR/AZ91_TEM_images"
$ECHO $COMMAND mcfada@umich.edu marquislab "$BASEDIR/Data_MatComm"
$ECHO $COMMAND pengwchu@umich.edu marquislab "$BASEDIR/Materials Commons Data-Peng-Wei/WE43 alloy corrosion"
$ECHO $COMMAND pengwchu@umich.edu marquislab "$BASEDIR/Materials Commons Data-Peng-Wei/Ti-Al alloy precipitation"
$ECHO $COMMAND esitz@umich.edu marquislab "$BASEDIR/WE43 Heat Treatments"
