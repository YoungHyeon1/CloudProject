import boto3
from datetime import datetime
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChatMessages')

def stream_handler(event, context):
    # event에서 메시지 데이터 추출
    try:
        return get_cognito_users(event)
        if event.get('path') == '/cognito-users':
            return get_cognito_users(event)
        elif event.get('path') == '/ivs-status':
            return get_ivs_status(event)
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

def get_cognito_users(event):
    client = boto3.client('cognito-idp')
    user_pool_id = 'ap-northeast-2_PaBnNNLer'

    response = client.list_users(UserPoolId=user_pool_id)
    result = {}
    # 반환된 사용자 목록 사용
    for user in response['Users']:
        for attribute in user["attributes"]:
            if attribute["Name"] in ["custom:chanelName", "custom:playbackUrl", "nickname"]:
                result[attribute["Name"].replace("custom:", "")]=attribute["Value"]
        
    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }

def get_ivs_status(event):
    client = boto3.client('ivs')
    # IVS 방송 상태 확인 로직
    response = {}  # 여기에 IVS 조회 로직 추가
    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }