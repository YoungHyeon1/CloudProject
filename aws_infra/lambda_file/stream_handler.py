import boto3
from datetime import datetime
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChatMessages')
user_pool_id = 'ap-northeast-2_PaBnNNLer'

def stream_handler(event, context):
    # event에서 메시지 데이터 추출
    try:
        if event.get('path') == '/users':
            return get_cognito_users(event)
        elif event.get('path') == '/broad_cast_status':
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

    response = client.list_users(UserPoolId=user_pool_id)
    exclude_attributes = ['sub', 'email_verified', 'email']
    user_attributes = []
    for user in response['Users']:
        attributes = {
            attr['Name']: attr['Value'] for 
            attr in user['Attributes'] 
            if attr['Name'] not in exclude_attributes
        }
        user_attributes.append(attributes)
    return {
        'statusCode': 200,
        'body': json.dumps(user_attributes)
    }

def get_ivs_status(event):
    client = boto3.client('ivs')
    cognito_client = boto3.client('cognito-idp')
    table = dynamodb.Table('UsersIntegration')
    # IVS 방송 상태 확인 로직
    try:
        response = table.scan()
        for item in response:
            if item["IsLive"] == "true":
                cognito_response = cognito_client.list_users(
                    UserPoolId=user_pool_id,
                     Username=item["email"]
                )
                users = response.get('Users', [])

        pass
        return {
            'statusCode': 200,
            'body': channel_response
        }
    except Exception as e:
        print("error line")
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error retrieving live channels'})
        }
