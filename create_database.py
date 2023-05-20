import json
import os
import psycopg2
from decimal import *
from psycopg2.extras import RealDictCursor
from django.core.serializers.json import DjangoJSONEncoder

database="postgiscwb"
user='postread' 
password='PostRead' 
host='localhost' 
port= '5435'

conn = psycopg2.connect(
        database=database, 
        user=user, 
        password=password, 
        host=host, 
        port=port
        )
cursor = conn.cursor()
try:
    sqlQuery = '''CREATE TABLE public.jeferson_usuarios_operacionais(
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        user_type TEXT NOT NULL
    )'''
    cursor.execute(sqlQuery)
    conn.commit()
except Exception as err:
    print ("Oops! An exception has occured:",err)
    print ("Exception TYPE:", type(err))

print('Usuarios Operacionais table created')    

conn.close()