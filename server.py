from unittest import result
from flask import Flask,  request, Response
from flask_mysqldb import MySQL
import time
import zipfile
import json
import datetime

import re
import os
import io
from google.cloud import vision
from pandas import describe_option

from sqlalchemy import false, true


app = Flask(__name__, static_folder='/')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'flask'

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./keyfile.json"


@app.route("/hello", methods=['GET'])
def hello():
    msg = 'hello'
    time.sleep(3)
    return msg


mysql = MySQL(app)


@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'GET':
        return "Login via the login Form"

    if request.method == 'POST':
        name = request.form['name']
        age = request.form['age']
        cursor = mysql.connection.cursor()
        cursor.execute(
            ''' INSERT INTO info_table VALUES(%s,%s)''', (name, age))
        mysql.connection.commit()
        cursor.close()
        return f"Done!!"


@app.route('/upload', methods=['POST'])
def upload():

    if request.method == 'POST':

        recordDist = {}

        # app.logger.info(request.files)
        file = request.files['file']
        file_like_object = file.stream._file
        zipfile_ob = zipfile.ZipFile(file_like_object)
        file_names = zipfile_ob.namelist()
        targetfile = 'Takeout/定位記錄/Semantic Location History/2022/2022_APRIL.json'

        with zipfile_ob.open(targetfile, mode='r') as f:
            zipinfo = json.load(f)
            for dict in zipinfo["timelineObjects"]:
                for key, value in dict.items():
                    if key == "activitySegment":
                        if all(k in value for k in ("distance", "activityType", "duration")):
                            startTime = datetime.datetime.strptime(
                                value["duration"]["startTimestamp"][:19], '%Y-%m-%dT%H:%M:%S')
                            endTime = datetime.datetime.strptime(
                                value["duration"]["endTimestamp"][:19], '%Y-%m-%dT%H:%M:%S')
                            duration = int((
                                endTime - startTime).total_seconds() / 60)
                            date = value["duration"]["startTimestamp"].split("T")[
                                0]
                            distanceKM = round((value["distance"] / 1000), 3)
                            vehicleType = value["activityType"]

                            dailyRecordDist = {
                                "Type": vehicleType,
                                "Duration": duration,
                                "Distance": distanceKM
                            }

                            if date in recordDist:
                                if vehicleType in recordDist[date]["Summary"]:
                                    recordDist[date]["Summary"][vehicleType]["Duration"] += duration
                                    recordDist[date]["Summary"][vehicleType]["Distance"] += distanceKM
                                else:
                                    recordDist[date]["Summary"][vehicleType] = {
                                        "Duration": duration,
                                        "Distance": distanceKM
                                    }
                                recordDist[date]["Record List"].append(
                                    dailyRecordDist)
                            else:
                                recordDist[date] = {
                                    "Summary": {
                                        vehicleType: {
                                            "Duration": duration,
                                            "Distance": distanceKM
                                        }
                                    },
                                    "Record List": [dailyRecordDist]
                                }
        response = app.response_class(
            response=json.dumps(recordDist),
            status=200,
            mimetype='application/json'
        )
        # print(response)
        return response


client = vision.ImageAnnotatorClient()


@app.route("/scan", methods=['POST'])
def scan():

    # file_name = os.path.abspath(
    #     'D:/sideproject/carbon_emission/src/20220510_222131.jpg')
    # with io.open(file_name, 'rb') as image_file:
    #     content = image_file.read()

    image = vision.Image(content=request.data.decode("utf-8"))

    result = client.text_detection(image=image)
    texts = result.text_annotations
    # print(result)

    if texts != []:
        print('\n"{}"'.format(texts[0].description))
        resp = app.response_class(
            response=json.dumps({
                "message": "未偵測到學生證號碼",
            }),
            status=404,
            mimetype='application/json'
        )

        descriptionList = texts[0].description.split("\n")
        studentIDIndex = -1
        for text in descriptionList:
            studentIDIndex += 1
            if (re.search(r"^([a-zA-Z1][a-zA-Z0-9])([0-9]{7})$", text)):
                if text[0] == "1":
                    text = "I" + text[1:]
                studentID = text
                nameIndex = studentIDIndex - 1
                name = descriptionList[nameIndex]
                print(f"{studentID}\n{name}")
                resp = app.response_class(
                    response=json.dumps({
                        "ID": studentID,
                        "Name": name
                    }),
                    status=200,
                    mimetype='application/json'
                )
                break

        # studentIDIndex = -1
        # for text in texts:
        #     studentIDIndex += 1
        #     if (re.search(r"^([a-zA-Z][a-zA-Z0-9])([0-9]{7})$", text.description)):
        #         studentID = text.description
        #         nameIndex = studentIDIndex - 1
        #         name = texts[nameIndex].description
        #         print(f"{studentID}\n{name}")
        #         resp = app.response_class(
        #             response=json.dumps({
        #                 "ID": studentID,
        #                 "Name": name
        #             }),
        #             status=200,
        #             mimetype='application/json'
        #         )
        #         break
    else:
        resp = app.response_class(
            response=json.dumps({
                "message": "未偵測到文字",
            }),
            status=404,
            mimetype='application/json'
        )

    # if result.error.message:
    #     raise Exception(
    #         '{}\nFor more info on error messages, check: '
    #         'https://cloud.google.com/apis/design/errors'.format(
    #             result.error.message))

    return resp


if __name__ == "__main__":
    app.run(debug=True)
