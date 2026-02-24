# HubSpot Private App - Static Authentication Template

HubSpot Private App 개발을 위한 시작 템플릿입니다. Static 인증 방식을 사용하며, CRM 카드, 웹훅, 워크플로우 액션 등 주요 확장 기능들을 포함하고 있습니다.

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [요구사항](#요구사항)
- [시작하기](#시작하기)
- [아키텍처](#아키텍처)
- [주요 구성 요소](#주요-구성-요소)
- [개발 가이드](#개발-가이드)

## 프로젝트 개요

**프로젝트 정보:**
- 이름: `private-app-static-getting-started-template`
- 플랫폼 버전: `2025.2`
- 소스 디렉토리: `src/`
- 인증 방식: Static (정적 액세스 토큰)

이 템플릿은 HubSpot CRM 확장을 위한 다음 기능들을 포함합니다:
- ✅ React 기반 CRM 카드
- ✅ 웹훅 구독 설정
- ✅ 커스텀 워크플로우 액션

## 요구사항

프로젝트를 시작하기 전에 다음 사항들이 준비되어야 합니다:

- 활성 HubSpot 계정
- [HubSpot CLI](https://www.npmjs.com/package/@hubspot/cli) 설치 및 설정
- Developer Projects 접근 권한 ([CRM Development Tools 공개 베타](https://app.hubspot.com/l/whats-new/betas))

## 시작하기

### 로컬 개발 서버 실행

```bash
hs project dev
```

이 명령어는 HubSpot CLI 개발 서버를 실행하여 로컬에서 앱 컴포넌트를 테스트하고 반복 작업을 수행할 수 있게 합니다. CLI 프롬프트를 따라 HubSpot 계정에 연결하세요.

## 아키텍처

### 메타데이터 기반 구성

이 프로젝트는 메타데이터 기반 아키텍처를 사용하며, 각 컴포넌트는 `-hsmeta.json` 파일로 정의됩니다:

```
프로젝트 루트/
├── hsproject.json                 # 프로젝트 설정
└── src/app/
    ├── app-hsmeta.json           # 앱 설정 (인증, 스코프, 허용 URL)
    ├── cards/                     # CRM 카드 컴포넌트
    │   ├── example-app-card.jsx
    │   ├── example-app-card-hsmeta.json
    │   └── package.json
    ├── webhooks/                  # 웹훅 구독
    │   └── webhooks-hsmeta.json
    └── workflow-actions/          # 워크플로우 액션
        └── my-workflow-action-hsmeta.json
```

### 인증 및 권한 설정

앱은 Static 인증을 사용하며 `src/app/app-hsmeta.json`에서 설정됩니다:

**필수 OAuth 스코프:**
- `crm.objects.contacts.read` - 연락처 읽기
- `crm.objects.contacts.write` - 연락처 쓰기
- `crm.schemas.companies.read` - 회사 스키마 읽기
- `crm.schemas.companies.write` - 회사 스키마 쓰기

**허용된 URL:**
- Fetch: `https://api.hubapi.com` (HubSpot API 호출 허용)

> 💡 **참고:** 새로운 API 기능이 필요한 경우, `src/app/app-hsmeta.json`의 `requiredScopes` 배열에 OAuth 스코프를 추가하세요.

## 주요 구성 요소

### 1. CRM 카드 (Cards)

**위치:** `src/app/cards/`

React 컴포넌트로 작성되며 CRM 레코드에 렌더링됩니다.

**기술 스택:**
- React 18.2.0
- @hubspot/ui-extensions (최신)
- TypeScript 5.3.3 (개발 의존성)

**주요 기능:**
- Contact 및 Company 레코드 탭에 표시
- `@hubspot/ui-extensions` 라이브러리의 UI 컴포넌트 사용
- `hubspot.extend()`를 통한 컴포넌트 등록

**메타데이터 설정 예시 (`example-app-card-hsmeta.json`):**
```json
{
  "uid": "example_app_card_private_static",
  "type": "card",
  "config": {
    "name": "Example App Card",
    "entrypoint": "/app/cards/example-app-card.jsx",
    "location": "crm.record.tab",
    "objectTypes": ["CONTACT", "COMPANY"]
  }
}
```

### 2. 웹훅 (Webhooks)

**위치:** `src/app/webhooks/webhooks-hsmeta.json`

**설정:**
- Target URL: `https://example.com/webhook` ⚠️ (실제 URL로 변경 필요)
- 최대 동시 요청: 10개

**지원하는 구독 타입:**

1. **CRM Objects (최신 방식):**
   - `object.propertyChange` - 객체 속성 변경 감지
   - `object.creation` - 객체 생성 감지

2. **Legacy CRM Objects (레거시 방식):**
   - `contact.propertyChange` - 연락처 속성 변경
   - `contact.deletion` - 연락처 삭제

3. **Hub Events:**
   - `contact.privacyDeletion` - 개인정보 삭제 (GDPR 관련)

### 3. 워크플로우 액션 (Workflow Actions)

**위치:** `src/app/workflow-actions/my-workflow-action-hsmeta.json`

HubSpot 워크플로우에서 사용할 수 있는 커스텀 액션입니다.

**주요 구성:**
- Action URL: `https://example.com/hubspot` ⚠️ (실제 URL로 변경 필요)
- 지원 객체: Contact, Deal

**입력 필드:**
1. **widgetName** (필수, string) - 위젯 이름
2. **widgetColor** (선택, enumeration) - 색상 선택 (빨강/파랑/녹색)
3. **widgetOwner** (선택, enumeration) - Owner 참조
4. **widgetQuantity** (선택, number) - 객체 속성에서 가져오는 수량

**입력 필드 타입:**
- `string`, `number` - 기본 타입
- `enumeration` - 드롭다운 선택
- `referencedObjectType` - HubSpot 객체 참조

## 개발 가이드

### 새 CRM 카드 만들기

1. `src/app/cards/` 디렉토리에 `.jsx` 파일 생성
2. React 컴포넌트 작성:
```jsx
import React from "react";
import { hubspot } from "@hubspot/ui-extensions";

hubspot.extend(() => <MyCard />);

const MyCard = () => {
  return <div>My Card Content</div>;
};
```
3. 해당 카드의 `-hsmeta.json` 파일 생성:
```json
{
  "uid": "my_card_uid",
  "type": "card",
  "config": {
    "name": "My Card",
    "entrypoint": "/app/cards/my-card.jsx",
    "location": "crm.record.tab",
    "objectTypes": ["CONTACT"]
  }
}
```

### 웹훅 구독 추가하기

`src/app/webhooks/webhooks-hsmeta.json`의 `subscriptions` 섹션에 새 구독 추가:

```json
{
  "subscriptionType": "object.propertyChange",
  "objectType": "company",
  "propertyName": "name",
  "active": true
}
```

### 워크플로우 액션 설정하기

`inputFields` 배열에 필요한 필드 정의:

```json
{
  "typeDefinition": {
    "name": "myField",
    "type": "string",
    "fieldType": "text"
  },
  "supportedValueTypes": ["STATIC_VALUE"],
  "isRequired": true
}
```

## 주의사항 및 다음 단계

⚠️ **변경이 필요한 예시 값:**
- 웹훅 Target URL: `https://example.com/webhook`
- 워크플로우 액션 URL: `https://example.com/hubspot`
- Support 정보: `src/app/app-hsmeta.json`의 support 섹션

📚 **유용한 리소스:**
- [UI Components 라이브러리](https://developers.hubspot.com/docs/platform/ui-components)
- [HubSpot 개발자 문서](https://www.developers.hubspot.com)
- [UI Extensions 예제](https://github.com/hubspot/ui-extensions-examples)
- [HubSpot 개발자 Slack](https://developers.hubspot.com/slack)

## 라이선스

MIT
