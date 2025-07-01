# CLOUMER – Streaming Services Using Cloud

**CLOUMER**는 “Cloud”와 “Streamer”의 합성어로,  
클라우드 인프라를 활용하여 실시간 영상 스트리밍 서비스를 제공하는 프로젝트입니다.  
본 프로젝트는 Serverless 아키텍처를 활용하여 탄력적이고 확장 가능한 스트리밍 플랫폼을 구축했습니다.

---

## 📌 프로젝트 개요

- **프로젝트명**: CLOUMER
- **목표**
  - Serverless 기반의 안정적이고 유연한 스트리밍 서비스 구축
  - AWS IVS(Interactive Video Service)를 활용한 라이브 스트리밍
  - 사용자 인증, 채팅 등 부가 서비스 구현
- **팀원 및 역할**
  - 김영현 (YoungHyeon1) – Backend 개발, Cloud Service 운영
  - 홍태의 (Undery33) – Frontend 개발, PPT 및 보고서 작성

- **GitHub Repository**: [https://github.com/YoungHyeon1/CloudProject](https://github.com/YoungHyeon1/CloudProject)
- **서비스 배포 URL**
  - Main: [cloumer.kro.kr](http://cloumer.kro.kr)
  - CDN: [https://d128m1wh0mvgz3.cloudfront.net/](https://d128m1wh0mvgz3.cloudfront.net/)

---

## 💻 기술 스택

- **Frontend**
  - ReactJS (18.2.0)
  - AWS IVS Player Integration
- **Backend / Infra**
  - Python 3.8
  - AWS Lambda
  - AWS API Gateway
  - Amazon DynamoDB
  - Amazon Cognito
  - Amazon EventBridge
  - Amazon CloudWatch
  - Amazon S3
  - AWS IAM
  - AWS IVS (Interactive Video Service)
  - Terraform
- **DevOps & Code Quality**
  - ESLint (JavaScript)
  - Flake8 (Python)

---

## 🌐 주요 기능

### UI Pages

- **HOME** – 메인 화면
- **PROFILE** – 사용자 정보
- **STREAMING** – 실시간 영상 스트리밍 화면

### Service Architecture

- **User Authentication**
  - Amazon Cognito로 회원가입 및 인증
  - Lambda Trigger를 이용한 유저 관리
- **Streaming**
  - Amazon IVS로 라이브 스트리밍 송출
  - IVS Chat (WebSocket 기반 채팅)
  - 방송 상태 모니터링
- **API**
  - API Gateway + Lambda 기반의 Public / Private API 관리
- **Event Handling**
  - Amazon EventBridge로 이벤트 연동
- **Logging & Monitoring**
  - Amazon CloudWatch
- **Storage**
  - Amazon S3

---

## ⚙️ Getting Started

프로젝트를 로컬에서 실행하기 위해 아래 단계를 진행해 주세요.

### 1. Clone Repository

```bash
git clone https://github.com/YoungHyeon1/CloudProject.git
```

---

### 2. Frontend 실행
실행 전 config.js 파일 설정이 필요합니다.

```
cd ./stream-web/web-stream/src
vi config.js
```

설정 후 아래 명령어를 실행합니다.

```
cd ./stream-web/web-stream
npm install
npm start
```

---

### 3. Terraform 실행
Terraform을 이용해 AWS 인프라를 배포합니다.
실행 전 AWS CLI 설정을 완료해야 합니다.

```
terraform init
terraform plan
terraform apply
```

---

## 🧑‍💻 Code Lint
* ReactJS 코드는 ESLint로 정적 분석 및 포맷팅했습니다.

* Python 코드는 Flake8로 스타일 검사를 수행했습니다.

* GitHub Actions를 통해 Lint 체크 후 Merge 가능하도록 설정했습니다.

---

## 🚀 Deploy
Frontend는 AWS S3로 배포합니다.
추후 GitHub Actions와 연동하여 Main Branch Merge 시 자동 배포되도록 개선할 예정입니다.

### 배포 방법
```
npm run build
aws s3 sync ./build s3://[S3 버킷 이름]
```

---

### 🐛 Troubleshooting
주요 트러블슈팅 내역입니다.

* Lambda Proxy 설정 시 CORS 이슈
    * 해결: Access-Control-Allow-Origin 헤더 추가

* IVS Player Reload 문제

* Image Upload Error (Binary media types)

* JavaScript overlap Error

* React onKeyPress 이슈

---

> CLOUMER 프로젝트는 AWS Serverless 아키텍처 기반으로 개발되었으며,
클라우드의 유연성과 확장성을 활용하여 안정적인 스트리밍 서비스를 제공합니다.