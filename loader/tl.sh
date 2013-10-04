#!/bin/sh

HOST=$1
BASEDIR="/tmp/miaojias@umich.edu"

#COMMAND='java -classpath target/metaloader-jar-with-dependencies.jar org.prisms.loader.main.LoaderMain'
COMMAND="metaloader.py"

ECHO=""

#$ECHO $COMMAND $HOST virn@umich.edu allisonlab "$BASEDIR/6111_Aluminum_Alloys"
$ECHO $COMMAND $HOST miaojias@umich.edu allisonlab $BASEDIR/AZ91_TEM_images
#$ECHO $COMMAND $HOST mcfada@umich.edu marquislab $BASEDIR/Data_MatComm
#$ECHO $COMMAND $HOST pengwchu@umich.edu marquislab "$BASEDIR/Materials Commons Data-Peng-Wei/WE43 alloy corrosion"
#$ECHO $COMMAND $HOST pengwchu@umich.edu marquislab "$BASEDIR/Materials Commons Data-Peng-Wei/Ti-Al alloy precipitation"
#$ECHO $COMMAND $HOST esitzmann@umich.edu marquislab "$BASEDIR/WE43 Heat Treatments"
