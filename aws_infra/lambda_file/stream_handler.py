import boto3
from datetime import datetime
import json
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')


def stream_handler(event, context):
    # event에서 메시지 데이터 추출
    try:
        if event.get('path') == '/stream/get_caht':
            create_token(event)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid request')
            } 
    except Exception as e:
        print(e)
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'}
    }

def create_token(event):
    '''
    event에서 인증된 Token의 파싱값을 가져옵니다.
    event에서 받은 params에서 채팅의 RoomToken값을 가져옵니다.
    '''
    client = boto3.client('ivschat')
    table=dynamodb.Table('UsersIntegration')
    chanel_name = event['requestContext']['authorizer']['claims']['custom:chanelName']
    response = table.query(
        KeyConditionExpression=Key('SubKey').eq(chanel_name)
    )

    chat_arn=response['Items'][0]['IvsChatArn']

    response = client.create_chat_token(
        capabilities=['SEND_MESSAGE'],
        roomIdentifier= chat_arn,
        sessionDurationInMinutes=100,
        userId=chanel_name
    )

    return {
        'statusCode': 200,
        'body': json.dumps(response["toekn"])
    }