import boto3
import json
from boto3.dynamodb.conditions import Key
import time

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChatMessages')
user_pool_id = 'ap-northeast-2_INqpBvMxg'
cognito_app_id = 'o43d44nut01aqi5im5l30l0fi'

header = {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Content-Type': 'application/json',
        }


def public_stream_handler(event, context):
    # event에서 메시지 데이터 추출
    try:
        if event.get('path') == '/public/users':
            return get_cognito_users(event)
        elif event.get('path') == '/public/broadcast_status':
            return get_ivs_status(event)
        elif event.get('path') == '/public/get_channel':
            return get_channel(event)
        elif event.get('path') == '/public/get_chat':
            return create_token(event)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid request')
            }
    except Exception as e:
        print(e)


def get_cognito_users(event):
    client = boto3.client('cognito-idp')
    table = dynamodb.Table('UsersIntegration')

    response = client.list_users(UserPoolId=user_pool_id)
    user_attributes = []

    query_params = event.get('queryStringParameters', {})
    if query_params:
        chanel = query_params.get('getProfile', None)
        user_info = table.query(
            KeyConditionExpression=Key('SubKey').eq(chanel)
        )
        attributes = {
            "profile": user_info['Items'][0]["profile"],
        }
        return {
            'statusCode': 200,
            'headers': header,
            'body': json.dumps(attributes)
        }
    for user in response['Users']:
        cognito_data = {
            attr['Name']: attr['Value']
            for attr in user['Attributes'] if attr['Name']
        }
        if cognito_data.get('custom:chanelName') is None:
            continue
        user_info = table.query(
            KeyConditionExpression=(
                Key('SubKey').eq(cognito_data['custom:chanelName'])
            )
        )

        if user_info['Items'] == []:
            continue
        attributes = {
            "nickname": cognito_data["nickname"],
            "chanelName": user_info['Items'][0]["SubKey"],
            "profile": user_info['Items'][0]["profile"],
        }

        user_attributes.append(attributes)
    return {
        'statusCode': 200,
        'headers': header,
        'body': json.dumps(user_attributes)
    }


def get_ivs_status(event):
    cognito_client = boto3.client('cognito-idp')
    table = dynamodb.Table('UsersIntegration')
    # IVS 방송 상태 확인 로직
    cognito_response = ''
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

                temp = [
                    attr['Value'] for attr
                    in cognito_response['UserAttributes']
                    if attr['Name'] in 'nickname'
                ]
                result_dict["nick_name"] = temp[0]
                result_dict["title"] = item["BoradCastTitle"]
                result_dict["sub_key"] = item["SubKey"]
                result_dict["thumbnail"] = (
                    item.get("thumbnail") if item.get("thumbnail")
                    else (
                        "https://project-app-prod-silla.s3.amazonaws.com/"
                        "profile_images/default_img.png"
                    )
                )
                result_dict['profile'] = item["profile"]

                if result_dict:
                    result.append(result_dict)
            except Exception as e:
                print(e)

    return {
        'statusCode': 200,
        'headers': header,
        'body': json.dumps(result)
    }


def get_channel(event):
    client = boto3.client('ivs')
    table = dynamodb.Table('UsersIntegration')
    query_params = event.get('queryStringParameters', {})
    channel = query_params.get('code', None)
    result_dict = {}
    user_info = table.query(
        KeyConditionExpression=Key('SubKey').eq(channel)
    )

    ivs_response = client.get_channel(arn=user_info['Items'][0]["IvsArn"])
    result_dict["play_back"] = (
        ivs_response["channel"]["playbackUrl"]
    )
    return {
        'statusCode': 200,
        'headers': header,
        'body': json.dumps(result_dict)
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
            'headers': header,
            'body': json.dumps('Invalid request')
        }

    result = {}
    # Ivs Client, Dynamodb Client를 생성합니다.
    client = boto3.client('ivschat')
    table = dynamodb.Table('UsersIntegration')

    try:
        target_response = table.query(
            KeyConditionExpression=Key('SubKey').eq(target_chanel)
        )
        chat_arn = target_response['Items'][0]['IvsChatArn']
        timestamp = time.time()

        # Attribute의 URL은 추후 변경이 필요합니다.
        # Ivs Client에서 토큰 생성작업입니다.
        chat_response = client.create_chat_token(
            roomIdentifier=chat_arn,
            sessionDurationInMinutes=100,
            userId=str(int(timestamp)),
        )
        result["sessionExpirationTime"] = (
            chat_response["sessionExpirationTime"]
            .isoformat()
        )
        result["tokenExpirationTime"] = (
            chat_response["tokenExpirationTime"]
            .isoformat()
        )
        result["token"] = chat_response["token"]

    except Exception as e:
        print(e)

    return {
        'statusCode': 200,
        'headers': header,
        'body': json.dumps(result)
    }
