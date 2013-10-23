#!/usr/bin/env python
import smtplib
from email.mime.text import MIMEText

fp = open('message.txt', 'rb')
msg = MIMEText(fp.read())
fp.close()

msg['Subject'] = "This is a review"
msg['From'] = 'gtarcea@umich.edu'
msg['To'] = 'review_010101@materialscommons.org'
s = smtplib.SMTP('localhost', 25001)
s.sendmail('gtarcea@umich.edu', ['review_010101@materialscommons.org'], msg.as_string())
s.quit()
