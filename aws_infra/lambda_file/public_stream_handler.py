import boto3
import json

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
    '''
    event에서 path를 가져와서 해당 path에 맞는 함수를 실행합니다.
    - get_cognito_users: Cognito에 가입된 유저들의 정보를 가져옵니다.
    - get_ivs_status: IVS 방송 상태를 가져옵니다.
    '''
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
    '''
    Cognito의 유저를 가져옵니다.
    - params: event
    - return: Nickname, ChanelName
    '''
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
        'headers': header,
        'body': json.dumps(user_attributes)
    }


def get_ivs_status(event):
    '''
    Ivs의 방송상태를 가져옵니다.
    Event Bridge에서 변경되면 Dynamodb에 저장되는 로직입니다.
    Exception은 Return 500으로 변경해야합니다.
    '''
    client = boto3.client('ivs')
    cognito_client = boto3.client('cognito-idp')
    table = dynamodb.Table('UsersIntegration')

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

                if result_dict:
                    result.append(result_dict)
            except Exception as e:
                print(e)

    return {
        'statusCode': 200,
        'headers': header,
        'body': json.dumps(result)
    }
