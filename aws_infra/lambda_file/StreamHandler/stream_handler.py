import json
import boto3
from boto3.dynamodb.conditions import Key
from requests_toolbelt.multipart import decoder
import base64

dynamodb = boto3.resource('dynamodb')

headers = {
    'Access-Control-Allow-Credentials': 'true',
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
        elif event.get('path') == '/stream/mypage':
            return get_mypage(event)
        elif event.get('path') == '/stream/save_mypage':
            return save_mypage(event)
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

    # Ivs Client, Dynamodb Client를 생성합니다.
    client = boto3.client('ivschat')
    table = dynamodb.Table('UsersIntegration')
    chanel_name = (
        event['requestContext']['authorizer']
        ['claims']['custom:chanelName']
    )
    try:
        target_response = table.query(
            KeyConditionExpression=Key('SubKey').eq(target_chanel)
        )
        my_response = table.query(
            KeyConditionExpression=Key('SubKey').eq(chanel_name)
        )
        chat_arn = target_response['Items'][0]['IvsChatArn']

        # Attribute의 URL은 추후 변경이 필요합니다.
        # Ivs Client에서 토큰 생성작업입니다.
        chat_response = client.create_chat_token(
            capabilities=['SEND_MESSAGE'],
            roomIdentifier=chat_arn,
            sessionDurationInMinutes=100,
            userId=chanel_name,
            attributes={
                "username": (
                    event["requestContext"]["authorizer"]
                         ["claims"]["nickname"]
                ),
                "avatar": my_response['Items'][0]['profile']
            }
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
        'headers': headers,
        'body': json.dumps(result)
    }


def get_mypage(event):
    '''
    event에서 인증된 Token의 파싱값을 가져옵니다.
    '''
    # Query Params 를 가져옵니다.

    # Dynamodb Client를 생성합니다.
    try:
        ivs_client = boto3.client('ivs')
        chanelName = (
            event['requestContext']['authorizer']
            ['claims']['custom:chanelName']
        )
        table = dynamodb.Table('UsersIntegration')
        user_info = table.query(
            KeyConditionExpression=Key('SubKey').eq(chanelName)
        )
        user = user_info["Items"][0]
        ivs_info = ivs_client.get_channel(arn=user["IvsArn"])
        stream_key = ivs_client.list_stream_keys(channelArn=ivs_info["channel"]["arn"])
        stream_arn = [key['arn'] for key in stream_key['streamKeys']]
        ivs_stream_key = ivs_client.get_stream_key(arn=stream_arn[0])
        result = {
            "boradCastTitle": user["BoradCastTitle"],
            "isLive": user["IsLive"],
            "chanelName": user["SubKey"],
            "streamKey": ivs_stream_key["streamKey"]["value"],
            "streamUrl": "rtmps://f41ac9ca0fdc.global-contribute.live-video.net:443/app/",
            "playbackUrl": ivs_info["channel"]["playbackUrl"],
            "profileImage": user.get("ProfileImage"),
        }
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps('Server Error')
        }


def save_mypage(event):

    try:
        s3_client = boto3.client('s3')
        table = dynamodb.Table('UsersIntegration')
        s3_bucket_name = 'project-app-prod-silla'
        chanelName = (
            event['requestContext']['authorizer']
            ['claims']['custom:chanelName']
        )
        body = base64.b64decode(event['body'])
        
        if 'content-type' in event['headers']:
            content_type = event['headers']['content-type']
        else:
            content_type = event['headers']['Content-Type']
        
        decode = decoder.MultipartDecoder(body,content_type)
        s3_key = f"profile_images/{chanelName}.jpg"

        for part in decode.parts:
            content = part.content
            headers = part.headers

        s3_client.put_object(
            Bucket=s3_bucket_name,
            Key=s3_key,
            Body=content,
            ContentType='image/jpeg'
        )

        # 이미지 URL 구성
        image_url = f'https://{s3_bucket_name}.s3.amazonaws.com/{s3_key}'

        test = table.update_item(
            Key={
                'SubKey': chanelName
            },
            UpdateExpression='SET profile = :val',
            ExpressionAttributeValues={
                ':val': image_url
            },
            ReturnValues='UPDATED_NEW'
        )
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',  # CORS 허용
                'Access-Control-Allow-Headers': 'Content-Type',  # 허용할 헤더
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'  # 허용할 HTTP 메소드
            },
            'body': json.dumps('이미지 업로드 성공')
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps('Server Error')
        }
