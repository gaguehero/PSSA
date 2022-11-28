import json
import os
import psycopg2
from decimal import *
from psycopg2.extras import RealDictCursor
from django.core.serializers.json import DjangoJSONEncoder

from flask import Flask, jsonify, render_template, url_for, request
app = Flask(__name__)

IMG_FOLDER = os.path.join('static', 'imgs')
app.config['UPLOAD_FOLDER'] = IMG_FOLDER

database="postgiscwb"
user='postread' 
password='PostRead' 
host='localhost' 
port= '5435'


@app.route('/')
@app.route('/index')
def home_page():
    example_embed='This string is from python'
    return render_template('index.html', embed=example_embed)

@app.route('/visualize')
def visualizer():
    return render_template('visualize.html')

@app.route('/register')
def register():
    return render_template('registerOcurrence.html')

@app.route('/accident', methods=['GET','POST'])
def getAccident():
    queryData = []
    date = request.form.get('date')
    cidade = request.form.get('cidade')
    id = request.form.get('id')
    if id:
        print('Buscando com ID de acidente')
        queryData.append(encontraAcidente(date, id))
    elif cidade:
        print('Buscando com cidade e data')
        queryData.append(encontraAcidente(date,'',cidade))
    else:
        print('Buscando com data')
        queryData.append(encontraAcidente(date))
    return json.dumps(queryData, indent=2, cls=DjangoJSONEncoder)

@app.route('/selOcc', methods=['GET', 'POST'])
def selOcc():
    occInfo = []
    idocc = request.form.get("id")
    dateocc = request.form.get("date")
    print(idocc)
    occInfo = fetchOccInfo(idocc, dateocc)
    for i in range(len(occInfo)):
        ans = encontraAcidente(0 ,id = str(occInfo[i]["id_acidente"]))
        for row in ans:
            occInfo.append(dict(row))
    print("Retorno gerado:", occInfo)
    return json.dumps(occInfo, indent=2, cls=DecimalEncoder, default=str)

@app.route('/test', methods=['GET', 'POST'])
def index():
  if request.method == 'POST':
    queryData = []
    idocc = request.form.get("id")
    print(idocc)
    occInfo = fetchOccInfo(idocc, 0)
    ans = encontraAcidente(0 ,id = str(occInfo[0]["id_acidente"]))
    for row in ans:
        queryData.append(dict(row))
    queryData.append(chamaBulancia(str(queryData[0]["longitude"]), str(queryData[0]["latitude"]), occInfo[0]["codigo_oaci"]))
    queryData.append(encontraHeliporto(str(queryData[0]["longitude"]), str(queryData[0]["latitude"]), str(occInfo[0]["crm"])))
    print("Query Data: ",queryData)
    return json.dumps(queryData, indent=2, cls=DecimalEncoder, default=str)

@app.route('/heliport', methods=['GET','POST'])
def findHeliport():
    queryData = []
    posX = request.form.get("x")
    posY = request.form.get("y")
    queryData.append(encontraHeliport(posX,posY)) 
    return queryData

@app.route('/hospital', methods=['GET','POST'])
def findHospital():
    queryData = []
    posX = request.form.get("x")
    posY = request.form.get("y")
    queryData.append(encontraHospital(posX,posY)) 
    return queryData

@app.route('/ocorrencia', methods=['GET','POST'])
def postOcorrencia():
    queryData = []
    id_ocorrencia = request.form.get("id_ocorrencia")
    id_acidente = request.form.get("id_acidente")
    codigo_oaci = request.form.get("codigo_oaci")
    id_plano_voo = request.form.get("id_plano_voo")
    crm = request.form.get("crm")
    data_hora = request.form.get("data_hora")
    cod_medico = request.form.get("cod_medico")
    cod_amb_aerea = request.form.get("cod_amb_geral")
    queryData.append(postaOcorrencia(id_ocorrencia, id_acidente, id_plano_voo, codigo_oaci, crm, data_hora, cod_medico, cod_amb_aerea)) 
    return queryData

@app.route('/sobre')
def sobreNos():
    return render_template('sobre.html')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        # 👇️ if passed in object is instance of Decimal
        # convert it to a string
        if isinstance(obj, Decimal):
            return str(obj)
        # 👇️ otherwise use the default behavior
        return json.JSONEncoder.default(self, obj)

def encontraAcidente(date, id='',cidade=''):
    conn = psycopg2.connect(
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port
    )
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sqlQuery = '''select id_acidente, data_inversa, horario, municipio, tipo_acidente, condicao_meteorologica, pessoas, latitude, longitude
        from trabalhos.jeferson_acidentes 
        where'''
    if id:
        sqlQuery= sqlQuery + " id_acidente = " + id
    else:
        if cidade:
            sqlQuery = sqlQuery + " municipio = '" + cidade + "' and"
        sqlQuery = sqlQuery + " data_inversa = '" + date + "'"
    print(sqlQuery)
    #Executing an MYSQL function using the execute() method
    cursor.execute(sqlQuery)
    # Fetch a single row using fetchone() method.
    data = cursor.fetchall()
    print("Result of the query: ",data)

    #Closing the connection
    conn.close()
    return data


def encontraHeliport(posX,posY):
    #establishing the connection
    conn = psycopg2.connect(
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port
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
    print("Result of the query: ",data)

    #Closing the connection
    conn.close()
    return data

def encontraHospital(posX,posY):
#establishing the connection
    conn = psycopg2.connect(
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port
    )
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sqlQuery = '''select crm ,nome, lat, lng, A.geom <-> 'SRID=29193;POINT('''+ posX + posY +''')'::geometry as dist, st_AsEWKT(geom)
    from trabalhos.jeferson_hospitais A order by dist limit 6'''
    #Executing an MYSQL function using the execute() method
    cursor.execute(sqlQuery)
    # Fetch a single row using fetchone() method.
    data = cursor.fetchall()
    print("Result of the query: ",data)

    #Closing the connection
    conn.close()
    return data

@app.route('/id', methods=['GET','POST'])
def fetchId():
    data = []
#establishing the connection
    conn = psycopg2.connect(
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port
    )
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sqlQuery = '''select MAX(id_ocorrencia) from trabalhos.jeferson_ocorrencias'''
    #Executing an MYSQL function using the execute() method
    cursor.execute(sqlQuery)
    # Fetch a single row using fetchone() method.
    data = cursor.fetchall()
    print("Result of the query: ",data)

    #Closing the connection
    conn.close()
    return data

def postaOcorrencia(id_ocorrencia, id_acidente, id_plano_voo, codigo_oaci, crm, data_hora, cod_medico, cod_amb_aerea):
#establishing the connection
    conn = psycopg2.connect(
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port
    )
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    sqlQuery = "INSERT INTO trabalhos.jeferson_ocorrencias(id_ocorrencia, id_acidente, id_plano_voo, codigo_oaci, crm, data_hora, cod_medico, codigo_amb_aerea) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
    val = (str(id_ocorrencia), str(id_acidente), id_plano_voo, str(codigo_oaci), str(crm), str(data_hora), str(cod_medico), str(cod_amb_aerea))
    #Executing an MYSQL function using the execute() method
    cursor.execute(sqlQuery, val)
    conn.commit()

    #Closing the connection
    conn.close()

def fetchOccInfo(id, date):
    #establishing the connection
    conn = psycopg2.connect(
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port
    )
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sqlQuery = '''select id_ocorrencia, id_acidente, codigo_oaci, crm
    from trabalhos.jeferson_ocorrencias
    where'''
    print("Data pesquisada: ",date)
    if id:
        sqlQuery= sqlQuery + " id_ocorrencia = " + id
    else:
        sqlQuery = sqlQuery + " data_hora = '" + date + "'"
    
    #Executing an MYSQL function using the execute() method
    cursor.execute(sqlQuery)

    # Fetch a single row using fetchone() method.
    ans = cursor.fetchall()
    data = []
    for row in ans:
        data.append(dict(row))
    print("Result of the query: ",ans)

    #Closing the connection
    conn.close()
    #return json.dumps(data, indent=2, cls=DecimalEncoder)
    return data

def chamaBulancia(posX, posY, id):
    #establishing the connection
    conn = psycopg2.connect(
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port
    )
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sqlQuery = '''select codigo_oaci,nome, latgeopoint,longeopoint, altitude,largura, superficie, A.the_geom <-> 'SRID=29193;POINT( '''+posX +posY +''')'::geometry AS dist, 
    st_AsEWKT(the_geom) from trabalhos.jeferson_meio_aereo A
    where'''
    if id:
        sqlQuery= sqlQuery + " codigo_oaci = '" + id + "'"
    #Executing an MYSQL function using the execute() method
    cursor.execute(sqlQuery)

    # Fetch a single row using fetchone() method.
    data = cursor.fetchall()
    print("Result of the query: ",data)

    #Closing the connection
    conn.close()
    #return json.dumps(data, indent=2, cls=DecimalEncoder)
    return data

def encontraHeliporto(posX,posY,id):
    #establishing the connection
    conn = psycopg2.connect(
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port
    )
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    sqlQuery = '''select crm ,nome, lat, lng, A.geom <-> 'SRID=29193;POINT('''+ posX + posY +''')'::geometry as dist, st_AsEWKT(geom)
    from trabalhos.jeferson_hospitais A 
    where'''
    if id:
        sqlQuery= sqlQuery + " crm = '" + id + "'"


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
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port)
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
