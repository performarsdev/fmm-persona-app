# HubSpot Private App - FMM Persona

HubSpot Private App으로 Contact 및 Company 레코드에서 연결된 FMM Persona 정보를 표시하는 CRM 카드 애플리케이션입니다.

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [요구사항](#요구사항)
- [시작하기](#시작하기)
- [구현 상세](#구현-상세)
- [보안 고려사항](#보안-고려사항)
- [문제 해결](#문제-해결)

## 프로젝트 개요

**프로젝트 정보:**
- 이름: `fmm-persona`
- 플랫폼 버전: `2025.2`
- 소스 디렉토리: `src/`
- 인증 방식: Private App Access Token

이 앱은 HubSpot CRM에서 다음 기능을 제공합니다:
- ✅ Contact/Company 레코드에 연결된 FMM Persona 정보 표시
- ✅ Custom Object (fmm_personars) 데이터 조회
- ✅ Association API를 통한 관계 조회
- ✅ 자동 Custom Object Type ID 조회

## 주요 기능

### Persona App Card

Contact 또는 Company 레코드에서 연결된 FMM Persona 정보를 표시하는 CRM 카드입니다.

**표시 정보:**

1. **Persona Highlight**
   - Persona Name
   - Persona Create Date
   - Persona Update Date

2. **Persona Details**
   - 기본 정보: 이름, 성별, 나이, 교육 수준
   - 지리/가구 정보: 지역, 가구 유형, 가구 소득
   - 심리 정보: 배경, 목표, 페인포인트, 스토리텔링
   - 키워드: 일반 키워드, 브랜드 키워드

3. **Persona Journey**
   - 인지 단계 목표 (Awareness)
   - 고려 단계 목표 (Consideration)
   - 결정 단계 목표 (Decision)
   - 온보딩 단계 목표 (Onboard)
   - 옹호 단계 목표 (Advocate)

## 요구사항

프로젝트를 시작하기 전에 다음 사항들이 준비되어야 합니다:

- 활성 HubSpot 계정
- [HubSpot CLI](https://www.npmjs.com/package/@hubspot/cli) 설치 및 설정
- Developer Projects 접근 권한
- HubSpot Private App Access Token
- Custom Object `fmm_personars` 생성 및 설정
- Contact/Company와 fmm_personars 간 Association 설정

## 시작하기

### 1. Private App Access Token 설정

1. HubSpot 계정에서 Private App 생성
2. 필요한 OAuth 스코프 부여 (아래 참조)
3. Access Token 복사
4. `src/app/cards/persona-app-card.jsx` 파일의 `PRIVATE_APP_TOKEN` 변수에 토큰 입력

```javascript
const PRIVATE_APP_TOKEN = 'your-private-app-token-here';
```

⚠️ **보안 경고:** 이 방식은 개발/테스트 용도로만 사용하세요. 프로덕션 환경에서는 별도의 백엔드 서버를 통해 토큰을 관리해야 합니다.

### 2. Custom Object Type ID 확인 (선택사항)

앱은 자동으로 `fmm_personars` Custom Object의 Type ID를 조회합니다. 수동으로 설정하려면:

1. HubSpot에서 Custom Objects → FMM Personars로 이동
2. URL에서 Type ID 확인 (예: `2-57656584`)
3. 필요시 코드의 `CUSTOM_OBJECT_TYPE_ID` 변수 수정

### 3. 로컬 개발 서버 실행

```bash
hs project dev
```

### 4. HubSpot에 업로드

```bash
hs project upload
```

## 구현 상세

### 프로젝트 구조

```
프로젝트 루트/
├── hsproject.json                          # 프로젝트 설정
├── fmm_persona.md                          # Persona 요구사항 문서
└── src/app/
    ├── app-hsmeta.json                    # 앱 설정 (스코프, 허용 URL)
    └── cards/
        ├── persona-app-card.jsx           # Persona 카드 React 컴포넌트
        ├── persona-app-card-hsmeta.json   # 카드 메타데이터
        └── package.json
```

### 필수 OAuth 스코프

`src/app/app-hsmeta.json`에 정의된 스코프:

```json
{
  "requiredScopes": [
    "oauth",
    "crm.objects.contacts.read",
    "crm.objects.contacts.write",
    "crm.schemas.companies.read",
    "crm.schemas.companies.write",
    "crm.objects.custom.read",
    "crm.objects.custom.write",
    "crm.schemas.custom.read",
    "crm.schemas.custom.write"
  ]
}
```

### 허용된 URL

HubSpot API 호출을 위한 허용 URL:

```json
{
  "permittedUrls": {
    "fetch": ["https://api.hubapi.com"]
  }
}
```

### 데이터 조회 프로세스

1. **Custom Object Type ID 자동 조회**
   - HubSpot Schemas API (`/crm/v3/schemas`) 호출
   - `fmm_personars` 이름으로 스키마 검색
   - `objectTypeId` 추출 (예: `2-57656584`)

2. **Association 조회**
   - Association API v4 사용
   - Contact/Company ID와 Custom Object Type ID로 연결된 Persona 조회
   - Endpoint: `/crm/v4/objects/{objectType}/{objectId}/associations/{toObjectType}`

3. **Persona 데이터 조회**
   - Custom Object API v3 사용
   - Persona ID로 상세 정보 조회
   - Endpoint: `/crm/v3/objects/{objectType}/{objectId}`

### 기술 스택

- React 18.2.0
- @hubspot/ui-extensions
- HubSpot Association API v4
- HubSpot Custom Objects API v3
- HubSpot Schemas API v3

## 보안 고려사항

### ⚠️ 현재 구현의 제한사항

**개발/테스트 전용:**
현재 구현은 Private App Access Token을 클라이언트 사이드 코드에 하드코딩하는 방식입니다. 이는 다음과 같은 보안 위험이 있습니다:

- 토큰이 브라우저에 노출됨
- 소스 코드에 토큰이 포함됨
- 토큰 탈취 시 전체 Private App 권한 노출

### 프로덕션 권장 사항

프로덕션 환경에서는 다음 방식을 권장합니다:

1. **백엔드 서버 구축**
   - Private App Token을 서버에서 안전하게 관리
   - UI Extension은 자체 백엔드 API를 호출
   - 백엔드에서 HubSpot API 호출 수행

2. **Request Signature 검증**
   - HubSpot에서 전송하는 요청의 서명 검증
   - `X-HubSpot-Signature-v3` 헤더 활용
   - 타임스탬프 검증으로 재생 공격 방지

3. **환경 변수 사용**
   - 토큰을 환경 변수로 관리
   - 코드 저장소에 토큰 커밋 금지
   - `.gitignore`에 토큰 파일 추가

### HubSpot Private App Token 자동 조회 불가

HubSpot UI Extension (CRM Card)에서는 Private App이 설치된 시점에 자신의 Access Token을 자동으로 조회할 수 있는 방법이 없습니다:

- `context` 객체에 Private App Token 미포함
- Serverless Function에서만 `context.secrets` 접근 가능
- Platform version `2025.2`는 serverless function 미지원

## 문제 해결

### Association이 없을 때

Contact/Company에 연결된 Persona가 없는 경우:
```
No persona associated with this contact
```

이는 정상적인 동작이며, Association을 생성하면 해결됩니다.

### Custom Object Type ID 오류

```
Unable to infer object type from: fmm_personars
```

이 오류는 Custom Object 이름 대신 Type ID를 사용해야 할 때 발생합니다. 앱은 자동으로 Type ID를 조회하므로, Schemas API 호출이 실패한 경우 발생할 수 있습니다.

**해결 방법:**
1. Custom Object가 생성되어 있는지 확인
2. 필요한 OAuth 스코프가 부여되었는지 확인
3. Private App Token이 올바른지 확인

### OAuth 스코프 오류

```
One or more of the following scopes are required
```

**해결 방법:**
1. `src/app/app-hsmeta.json`에 필요한 스코프 추가
2. 프로젝트 재업로드: `hs project upload`
3. HubSpot에서 Private App 권한 재확인

### 인증 오류

```
Authentication credentials not found
```

**해결 방법:**
1. Private App Access Token 확인
2. `PRIVATE_APP_TOKEN` 변수에 올바른 토큰 입력
3. Token이 만료되지 않았는지 확인

## 향후 개선 사항

- [ ] Custom Object Type ID 자동 조회 구현 완료
- [ ] 백엔드 서버 구축 (프로덕션 배포용)
- [ ] Request Signature 검증 구현
- [ ] 에러 처리 개선
- [ ] 로딩 상태 UX 개선
- [ ] Persona 데이터 캐싱
- [ ] Company 레코드 지원 테스트

📚 **유용한 리소스:**
- [UI Components 라이브러리](https://developers.hubspot.com/docs/platform/ui-components)
- [HubSpot 개발자 문서](https://www.developers.hubspot.com)
- [Association API v4](https://developers.hubspot.com/docs/api/crm/associations)
- [Custom Objects API](https://developers.hubspot.com/docs/api/crm/crm-custom-objects)

## 라이선스

MIT
