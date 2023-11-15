import json

def send_chat_handler(event, context):
    # Lambda 함수가 처리할 WebSocket 액션을 결정합니다.
    route_key = event['requestContext']['routeKey']

    if route_key == "$connect":
        # WebSocket 연결 처리
        return handle_connect(event)
    elif route_key == "$disconnect":
        # WebSocket 연결 해제 처리
        return handle_disconnect(event)
    else:
        # 사용자 정의 메시지 처리
        return handle_message(event)

def handle_connect(event):
    # 연결 처리 로직을 구현합니다.
    # 예: 사용자 연결 정보를 DynamoDB에 저장하기
    return {
        'statusCode': 200,
        'body': 'Connected.'
    }

def handle_disconnect(event):
    # 연결 해제 처리 로직을 구현합니다.
    # 예: 사용자 연결 정보를 DynamoDB에서 제거하기
    return {
        'statusCode': 200,
        'body': 'Disconnected.'
    }

def handle_message(event):
    # 사용자 메시지 처리 로직을 구현합니다.
    # 예: 메시지 내용을 기반으로 특정 작업 수행하기
    message = json.loads(event['body'])
    print("Received message:", message)
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Message received'})
    }
