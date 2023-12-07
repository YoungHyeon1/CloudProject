import boto3
import random
import string

dynamodb = boto3.resource('dynamodb')


def generate_random_string(length=10):
    '''
        ChanelName을 생성하는 코드입니다.
        기본 10자리로 Cognito의 Attribute 또한 10~11  자리로 설정했습니다.
    '''
    # 영어(대소문자), 숫자, 밑줄(_), 하이픈(-) 포함
    characters = string.ascii_letters + string.digits + "_-"
    # 무작위로 문자 선택하여 문자열 생성
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string


def create_room_handler(event, context):
    '''
        사후인증 트리거입니다.
        Cognito에 가입된 이메일 인증시 실행됩니다.
        Cognito에 가입된 유저의 Attribute에 채널이름을 설정합니다.
        채널이름은 랜덤으로 생성됩니다.
        생성된 채널이름을 통해 IVS 채널과 IVS Chat방을 생성합니다.
        생성된 정보는 Dynamodb에 저장합니다.
    '''
    client = boto3.client('ivs')
    client_chat = boto3.client('ivschat')
    cognito_client = boto3.client('cognito-idp')
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
        "email": event["request"]["userAttributes"]["email"],
        "IvsChatArn": response_chat["arn"],
        "BoradCastTitle": "Input Title",
        "IsLive": "false",
        "profile": (
            "https://project-app-prod-silla.s3.amazonaws.com/"
            "profile_images/default_profile.png"
        )
    }

    table = dynamodb.Table('UsersIntegration')
    table.put_item(Item=user_info)

    return {
        'statusCode': 200,
        'body': "채널 생성완료"
    }
