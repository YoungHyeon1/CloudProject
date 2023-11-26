import boto3
from datetime import datetime
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChatMessages')
user_pool_id = 'ap-northeast-2_INqpBvMxg'

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
    cognito_response=''
    result = []
    response = table.scan()
    for item in response["Items"]:
        result_dict = {}
        if item["IsLive"] == "false":
            try:
                if item.get("email") is None:
                    continue
                cognito_response = cognito_client.admin_get_user(
                    UserPoolId=user_pool_id,
                    Username=item['email']
                )
                
                temp = [attr['Value'] for attr in cognito_response['UserAttributes'] if attr['Name'] in 'nickname']
                result_dict["nick_name"]=temp[0]
                
                ivs_response = client.get_channel(arn=item["IvsArn"])
                result_dict["play_back"] = ivs_response["channel"]["playbackUrl"]

                if result:
                    result.append(result_dict)
            except Exception as e:
                print(e)

    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }
