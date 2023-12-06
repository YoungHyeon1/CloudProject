import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')

headers = {
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
}

def stream_handler(event, context):
    '''
    event에서 path를 가져와서 해당 path에 맞는 함수를 실행합니다.
    - get_chat: 채팅을 위한 토큰을 생성합니다.
    '''
    try:
        if event.get('path') == '/stream/get_caht':
            return create_token(event)
        else:
            return {
                'statusCode': 404,
                'body': json.dumps('NOT FOUND')
            }
    except Exception as e:
        print(e)
    return {
        'statusCode': 200,
        'headers': headers,
    }


def create_token(event):
    '''
    event에서 인증된 Token의 파싱값을 가져옵니다.
    event에서 받은 params에서 채팅의 RoomToken값을 가져옵니다.
    '''

    # Query Params 를 가져옵니다.
    query_params = event.get('queryStringParameters', {})
    target_chanel = query_params.get('targetChanel', None)

    if target_chanel is None:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps('Invalid request')
        }

    result = {}

    #Ivs Client, Dynamodb Client를 생성합니다.
    client = boto3.client('ivschat')
    table = dynamodb.Table('UsersIntegration')
    chanel_name = (
        event['requestContext']['authorizer']
        ['claims']['custom:chanelName']
    )
    try:
        response = table.query(
            KeyConditionExpression=Key('SubKey').eq(target_chanel)
        )
        chat_arn = response['Items'][0]['IvsChatArn']

        # Attribute의 URL은 추후 변경이 필요합니다.
        # Ivs Client에서 토큰 생성작업입니다.
        chat_response = client.create_chat_token(
            capabilities=['SEND_MESSAGE'],
            roomIdentifier=chat_arn,
            sessionDurationInMinutes=100,
            userId=chanel_name,
            attributes = {
                "username": event["requestContext"]["authorizer"]["claims"]["nickname"],
                "avatar": "https://png.pngtree.com/png-vector/20190329/ourlarge/pngtree-vector-avatar-icon-png-image_889567.jpg"
            }
        )
        result["sessionExpirationTime"] = chat_response["sessionExpirationTime"].isoformat()
        result["tokenExpirationTime"] = chat_response["tokenExpirationTime"].isoformat()
        result["token"] = chat_response["token"]


    except Exception as e:
        print(e)

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(result)
    }
