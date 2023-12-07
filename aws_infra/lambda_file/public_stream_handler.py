import boto3
import json
from boto3.dynamodb.conditions import Key

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
    for user in response['Users']:
        cognito_data = (
            {
                attr['Name']: attr['Value'] for
                attr in user['Attributes'] if attr['Name']
            }
        )
        user_info = table.query(
            KeyConditionExpression=Key('SubKey').eq(
                cognito_data['custom:chanelName']
            )
        )
        print(user_info['Items'])
        if user_info['Items'] == []:
            continue
        attributes = {
            "nickname": cognito_data["nickname"],
            "chanelName": cognito_data["custom:chanelName"],
            "profile": user_info['Items'][0]["profile"],
        }

        user_attributes.append(attributes)
    return {
        'statusCode': 200,
        'headers': header,
        'body': json.dumps(user_attributes)
    }


def get_ivs_status(event):
    client = boto3.client('ivs')
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
                ivs_response = client.get_channel(arn=item["IvsArn"])
                result_dict["play_back"] = (
                    ivs_response["channel"]["playbackUrl"]
                )

                result_dict["title"] = item["BoradCastTitle"]
                result_dict["sub_key"] = item["SubKey"]
                result_dict["thumbnail"] = (
                    item.get("thumbnail") if item.get("thumbnail")
                    else (
                        "https://project-app-prod-silla.s3.amazonaws.com/"
                        "profile_images/default_img.png"
                    )
                )

                if result_dict:
                    result.append(result_dict)
            except Exception as e:
                print(e)

    return {
        'statusCode': 200,
        'headers': header,
        'body': json.dumps(result)
    }
