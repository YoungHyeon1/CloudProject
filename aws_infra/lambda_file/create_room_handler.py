import boto3
import json

import random
import string
dynamodb = boto3.resource('dynamodb')
def generate_random_string(length=10):
    # 영어(대소문자), 숫자, 밑줄(_), 하이픈(-) 포함
    characters = string.ascii_letters + string.digits + "_-"
    # 무작위로 문자 선택하여 문자열 생성
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string


def create_room_handler(event, context):
    client = boto3.client('ivs')
    client_chat = boto3.client('ivschat')
    cognito_client = boto3.client('cognito-idp')
    # cognito_client = boto3.client('cognito-idp')
    username = event['userName']
    chanel_name = generate_random_string()
    # IVS 채널 생성
    response = client.create_channel(
        name=chanel_name,  # 채널 이름 설정
        type='STANDARD',    # 채널 타입 설정 (예: 'STANDARD' 또는 'BASIC')
    )


    cognito_client.admin_update_user_attributes(
        UserPoolId="ap-northeast-2_INqpBvMxg",
        Username=username,
        UserAttributes=[
            {
                'Name': 'custom:chanelName',
                'Value': chanel_name
            }
        ]
    )

    response_chat = client_chat.create_room(
    name=chanel_name
    )

    user_info = {
        "UserKey": event["request"]["userAttributes"]["sub"],
        "SubKey": chanel_name,
        "IvsArn": response["channel"]["arn"],
        "email" : event["request"]["userAttributes"]["email"],
        "IvsChatArn": response_chat["arn"],
        "BoradCastTitle": "Input Title",
        "IsLive": "false"
    }

    table = dynamodb.Table('UsersIntegration')
    table.put_item(Item=user_info)
    # 생성된 채널 정보 로깅
    #print(json.dumps(response, indent=4))

    return {
        'statusCode': 200,
        'body': "채널 생성완료"
    }
