import json
import os
import psycopg2
from decimal import *
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, render_template, url_for, request
app = Flask(__name__)

IMG_FOLDER = os.path.join('static', 'imgs')
app.config['UPLOAD_FOLDER'] = IMG_FOLDER


@app.route('/')
@app.route('/index.html')
def home_page():
    example_embed='This string is from python'
    return render_template('index.html', embed=example_embed)

@app.route('/visualize')
def visualizer():
    return render_template('visualize.html')

@app.route('/test', methods=['GET', 'POST'])
def index():
  if request.method == 'POST':
    queryData = []
    posX = request.form.get("x")
    posY = request.form.get("y")
    print("X "+posX +" Y "+ posY)
    queryData.append(chamaBulancia(posX,posY))
    queryData.append(encontraHeliporto(posX,posY))
    return json.dumps(queryData, indent=2, cls=DecimalEncoder)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        # 👇️ if passed in object is instance of Decimal
        # convert it to a string
        if isinstance(obj, Decimal):
            return str(obj)
        # 👇️ otherwise use the default behavior
        return json.JSONEncoder.default(self, obj)

def chamaBulancia(posX,posY):
    #establishing the connection
    conn = psycopg2.connect(
        database="postgiscwb", 
        user='postread', 
        password='PostRead', 
        host='localhost', 
        port= '5435'
    )
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sqlQuery = '''select codigo_oaci,nome, latgeopoint,longeopoint, altitude,largura, superficie, A.the_geom <-> 'SRID=29193;POINT( '''+posX +posY +''')'::geometry AS dist, 
    st_AsEWKT(the_geom) from trabalhos.jeferson_meio_aereo A
    order by dist limit 6;
    '''
    #Executing an MYSQL function using the execute() method
    cursor.execute(sqlQuery)

    # Fetch a single row using fetchone() method.
    data = cursor.fetchall()
    print("Result of the query: ",data[2])

    #Closing the connection
    conn.close()
    #return json.dumps(data, indent=2, cls=DecimalEncoder)
    return data[5]

def encontraHeliporto(posX,posY):
    #establishing the connection
    conn = psycopg2.connect(
        database="postgiscwb", 
        user='postread', 
        password='PostRead', 
        host='localhost', 
        port= '5435'
    )
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sqlQuery = '''select crm ,nome, lat, lng, A.geom <-> 'SRID=29193;POINT('''+ posX + posY +''')'::geometry as dist, st_AsEWKT(geom)
    from trabalhos.jeferson_hospitais A order by dist limit 1'''


    #Executing an MYSQL function using the execute() method
    cursor.execute(sqlQuery)

    # Fetch a single row using fetchone() method.
    data = cursor.fetchall()
    print("Result of the query: ",data)

    #Closing the connection
    conn.close()
    #return json.dumps(data, indent=2, cls=DecimalEncoder)
    return data

@app.route('/getDistance', methods=['GET','POST'])
def getDistance():
    if request.method == 'POST':
        queryData = []
        point1 = [request.form.get('x1'),request.form.get('y1')]
        point2 = [request.form.get('x2'),request.form.get('y2')]

        conn = psycopg2.connect(
        database="postgiscwb", 
        user='postread', 
        password='PostRead', 
        host='localhost', 
        port= '5435')
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        sqlQuery = '''
            SELECT ST_Distance(
            ST_Transform('SRID=29193;POINT('''+point1[0]+point1[1]+''')'::geometry, 3857),
            ST_Transform('SRID=29193;POINT('''+point2[0]+point2[1]+''')'::geometry, 3857) );
        '''
        cursor.execute(sqlQuery)

        # Fetch a single row using fetchone() method.
        data = cursor.fetchone()
        print("Result of the query: ",data)

        #Closing the connection
        conn.close()
        return json.dumps(data, indent=2, cls=DecimalEncoder)

if __name__ == "__main__":
  app.run(debug=True)
