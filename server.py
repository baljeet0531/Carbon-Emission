from flask import Flask,  request, Response
from flask_mysqldb import MySQL
import time
import zipfile
import json
import datetime

from sqlalchemy import false, true

app = Flask(__name__, static_folder='/')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'flask'


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


if __name__ == "__main__":
    app.run(debug=True)
