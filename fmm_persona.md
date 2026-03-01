# FMM Persona Custom Object 구현 가이드

## 개요

이 문서는 HubSpot CRM에서 `fmm_persona` custom object를 생성하고, Contact 레코드의 crm.record.tab에서 해당 데이터를 조회하여 표시하는 방법을 설명합니다.

## HubSpot UI Extensions의 Custom Object 지원 범위

### 핵심 제한사항

**`fetchCrmObjectProperties`의 제한:**
- 현재 표시 중인 CRM 레코드의 프로퍼티만 조회 가능
- Associated objects의 프로퍼티는 직접 조회 불가능
- Custom object를 직접 조회하는 기능 없음

**출처:** [HubSpot Community](https://www.scopiousdigital.com/faq/use-fetchcrmobjectproperties-hubspot-retrieve-associated)
> "fetchCrmObjectProperties function is designed to retrieve properties from the object that the user is currently interacting with. Unfortunately, it does not support fetching properties of associated objects"

### 해결 방법

Associated custom object를 조회하려면 **HubSpot API를 직접 호출**해야 합니다:
- `hubspot.fetch()` 사용 (UI Extensions SDK 제공)
- HubSpot REST API 엔드포인트 직접 호출
- 허용된 URL: `https://api.hubapi.com`

## Custom Object 구조 설계

### fmm_persona Object 프로퍼티

#### 기본 정보
| 프로퍼티명 | 타입 | 설명 |
|-----------|------|------|
| `persona_name` | string | 페르소나 이름 |
| `persona_sex` | enumeration | 성별 (Male/Female/Other) |
| `persona_age` | number | 나이 |
| `education_level` | string | 학력 수준 |
| `persona_geography` | string | 지역 |
| `household_type` | enumeration | 가구 유형 |
| `household_income` | number | 가구 소득 |

#### 상세 정보
| 프로퍼티명 | 타입 | 설명 |
|-----------|------|------|
| `persona_background` | text | 페르소나 배경 (긴 텍스트) |
| `persona_goal` | text | 페르소나 목표 |
| `persona_painpoint` | text | 페르소나 고충 |
| `persona_storytelling` | text | 페르소나 스토리텔링 |
| `generic_keywords` | string | 일반 키워드 |
| `brand_keywords` | string | 브랜드 키워드 |

#### Journey 정보
| 프로퍼티명 | 타입 | 설명 |
|-----------|------|------|
| `awareness_goal` | text | 인지 단계 목표 |
| `consideration_goal` | text | 고려 단계 목표 |
| `decision_goal` | text | 결정 단계 목표 |
| `onboard_goal` | text | 온보딩 단계 목표 |
| `advocate_goal` | text | 옹호 단계 목표 |

#### 메타데이터
| 프로퍼티명 | 타입 | 설명 |
|-----------|------|------|
| `createdate` | datetime | 생성일 (자동) |
| `lastmodifieddate` | datetime | 최종 수정일 (자동) |

### Contact와 fmm_persona 연결

**Association 설정:**
- Contact ↔ fmm_persona 관계: **N:1** (여러 Contact가 하나의 Persona를 공유)
- 여러 Contact가 동일한 persona를 참조할 수 있음
- HubSpot에서 custom association 생성 필요

## 구현 방법

### 1. 권한 설정

`src/app/app-hsmeta.json` 파일에 custom object 스코프 추가:

```json
{
  "uid": "get_started_app",
  "type": "app",
  "config": {
    "name": "Get Started App",
    "auth": {
      "type": "static"
    },
    "scopes": [
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
      "crm.objects.custom.read",
      "crm.objects.custom.write"
    ],
    "permittedFetchUrls": [
      "https://api.hubapi.com"
    ]
  }
}
```

### 2. API 호출 구현

#### 데이터 흐름

```
Contact Record (sidebar)
    ↓
Card Component 로드
    ↓
1. Get Contact ID (context.crm.objectId)
    ↓
2. Fetch associated fmm_persona ID
    ↓
3. Fetch fmm_persona properties
    ↓
4. Render persona data
```

#### 구현 코드 예시

```javascript
import React, { useState, useEffect } from "react";
import { 
  Heading, 
  Divider, 
  Flex,
  Text,
  LoadingSpinner,
  hubspot 
} from "@hubspot/ui-extensions";

hubspot.extend(({ context, actions }) => (
  <Extension context={context} actions={actions} />
));

const Extension = ({ context, actions }) => {
  const [personaData, setPersonaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPersonaData = async () => {
      try {
        setLoading(true);
        
        // 1. Contact에 연결된 fmm_persona ID 조회
        const associationResponse = await hubspot.fetch(
          `https://api.hubapi.com/crm/v4/objects/contacts/${context.crm.objectId}/associations/fmm_persona`
        );
        
        if (!associationResponse.ok) {
          throw new Error(`Association API error: ${associationResponse.status}`);
        }
        
        const associations = await associationResponse.json();
        
        if (associations.results && associations.results.length > 0) {
          // N:1 관계이므로 첫 번째 (유일한) persona를 가져옴
          const personaId = associations.results[0].toObjectId;
          
          // 2. fmm_persona 프로퍼티 조회
          const properties = [
            "persona_name",
            "persona_sex",
            "persona_age",
            "education_level",
            "persona_geography",
            "household_type",
            "household_income",
            "persona_background",
            "persona_goal",
            "persona_painpoint",
            "persona_storytelling",
            "generic_keywords",
            "brand_keywords",
            "awareness_goal",
            "consideration_goal",
            "decision_goal",
            "onboard_goal",
            "advocate_goal",
            "createdate",
            "lastmodifieddate"
          ].join(",");
          
          const personaResponse = await hubspot.fetch(
            `https://api.hubapi.com/crm/v3/objects/fmm_persona/${personaId}?properties=${properties}`
          );
          
          if (!personaResponse.ok) {
            throw new Error(`Persona API error: ${personaResponse.status}`);
          }
          
          const personaResult = await personaResponse.json();
          setPersonaData(personaResult.properties);
        } else {
          // Persona가 연결되지 않은 경우
          setError("No persona associated with this contact");
        }
      } catch (err) {
        console.error("Failed to fetch persona data:", err);
        setError(err.message);
        actions.addAlert({
          type: "danger",
          message: "페르소나 데이터를 불러올 수 없습니다"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPersonaData();
  }, [context.crm.objectId]);

  if (loading) {
    return (
      <Flex direction="column" align="center" gap="medium">
        <LoadingSpinner />
        <Text>Loading persona data...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex direction="column" gap="small">
        <Text format={{ fontWeight: "bold" }}>Error</Text>
        <Text>{error}</Text>
      </Flex>
    );
  }

  if (!personaData) {
    return (
      <Text>No persona data available for this contact.</Text>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "--";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <Flex direction="column" gap="large">
      {/* Persona Highlight Section */}
      <Flex direction="column" gap="small">
        <Heading>Persona Highlight</Heading>
        <Divider />
        
        <Flex direction="row" justify="between" gap="medium">
          <Flex direction="column" gap="xs" flex={1}>
            <Text format={{ fontWeight: "bold" }}>PERSONA NAME</Text>
            <Text>{personaData.persona_name || "--"}</Text>
          </Flex>
          
          <Flex direction="column" gap="xs" flex={1}>
            <Text format={{ fontWeight: "bold" }}>PERSONA CREATE DATE</Text>
            <Text>{formatDate(personaData.createdate)}</Text>
          </Flex>
          
          <Flex direction="column" gap="xs" flex={1}>
            <Text format={{ fontWeight: "bold" }}>PERSONA UPDATE DATE</Text>
            <Text>{formatDate(personaData.lastmodifieddate)}</Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Persona Details Section */}
      <Flex direction="column" gap="small">
        <Heading>Persona Details</Heading>
        <Divider />
        
        <Flex direction="column" gap="medium">
          <Flex direction="row" gap="large">
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona name</Text>
              <Text>{personaData.persona_name || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Sex</Text>
              <Text>{personaData.persona_sex || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona age</Text>
              <Text>{personaData.persona_age || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Education level</Text>
              <Text>{personaData.education_level || "--"}</Text>
            </Flex>
          </Flex>
          
          <Flex direction="row" gap="large">
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona geography</Text>
              <Text>{personaData.persona_geography || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Household type</Text>
              <Text>{personaData.household_type || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Household income</Text>
              <Text>{personaData.household_income || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona background</Text>
              <Text>{personaData.persona_background || "--"}</Text>
            </Flex>
          </Flex>
          
          <Flex direction="row" gap="large">
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona goal</Text>
              <Text>{personaData.persona_goal || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona pain-point</Text>
              <Text>{personaData.persona_painpoint || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona Storytelling</Text>
              <Text>{personaData.persona_storytelling || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona Generic keywords</Text>
              <Text>{personaData.generic_keywords || "--"}</Text>
            </Flex>
          </Flex>
          
          <Flex direction="column" gap="xs">
            <Text format={{ fontWeight: "bold" }}>Persona brand keywords</Text>
            <Text>{personaData.brand_keywords || "--"}</Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Persona Journey Section */}
      <Flex direction="column" gap="small">
        <Heading>Persona Journey</Heading>
        <Divider />
        
        <Flex direction="column" gap="medium">
          <Flex direction="row" gap="large">
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona awareness goal</Text>
              <Text>{personaData.awareness_goal || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona consideration goal</Text>
              <Text>{personaData.consideration_goal || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona decision goal</Text>
              <Text>{personaData.decision_goal || "--"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona onboard goal</Text>
              <Text>{personaData.onboard_goal || "--"}</Text>
            </Flex>
          </Flex>
          
          <Flex direction="column" gap="xs">
            <Text format={{ fontWeight: "bold" }}>Persona advocate goal</Text>
            <Text>{personaData.advocate_goal || "--"}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
```

### 3. API 엔드포인트

#### Association 조회
```
GET /crm/v4/objects/contacts/{contactId}/associations/fmm_persona
```

**응답 예시 (N:1 관계):**
```json
{
  "results": [
    {
      "toObjectId": "12345678",
      "associationTypes": [...]
    }
  ]
}
```

**참고:** N:1 관계이므로 `results` 배열에는 일반적으로 하나의 persona만 포함됩니다.

#### Custom Object 프로퍼티 조회
```
GET /crm/v3/objects/fmm_persona/{personaId}?properties=persona_name,persona_age,...
```

**응답 예시:**
```json
{
  "id": "12345678",
  "properties": {
    "persona_name": "John Developer",
    "persona_age": "40",
    "persona_sex": "Male",
    ...
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

## 제약사항 및 고려사항

### 제약사항

1. **API 호출 필수**
   - `fetchCrmObjectProperties`로는 불가능
   - `hubspot.fetch()`를 통한 API 직접 호출 필수

2. **다단계 API 호출**
   - Association 조회 → Custom object 조회 (2단계)
   - 추가 네트워크 요청으로 인한 로딩 시간 증가

3. **권한 관리**
   - Custom object 읽기/쓰기 권한 필요
   - App 재배포 시 권한 승인 필요

### 고려사항

1. **에러 처리**
   - Persona가 연결되지 않은 Contact 케이스
   - API 호출 실패 시 fallback UI
   - 네트워크 오류 처리

2. **로딩 상태 관리**
   - 여러 API 호출의 순차 처리
   - 사용자에게 로딩 상태 표시

3. **N:1 관계 특성**
   - 각 Contact는 하나의 persona만 참조
   - 여러 Contact가 동일한 persona를 공유 가능
   - Persona 데이터 변경 시 연결된 모든 Contact에 영향

4. **성능 최적화**
   - 필요한 프로퍼티만 요청
   - 캐싱 전략 고려
   - 불필요한 재조회 방지

## 배포 전 체크리스트

- [ ] HubSpot에서 `fmm_persona` custom object 생성
- [ ] 모든 필요한 프로퍼티 정의
- [ ] Contact ↔ fmm_persona association 설정
- [ ] `app-hsmeta.json`에 custom object 스코프 추가
- [ ] API 호출 코드 구현 및 테스트
- [ ] 에러 처리 및 로딩 상태 구현
- [ ] Persona가 없는 Contact 케이스 테스트
- [ ] 앱 재배포 및 권한 승인

## 참고 자료

- [HubSpot UI Extensions SDK Reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-extensions-sdk)
- [HubSpot Custom Objects API Guide](https://developers.hubspot.com/docs/api-reference/crm-custom-objects-v3/guide)
- [HubSpot Associations API](https://developers.hubspot.com/docs/api/crm/associations)
- [HubSpot Community - fetchCrmObjectProperties Limitations](https://www.scopiousdigital.com/faq/use-fetchcrmobjectproperties-hubspot-retrieve-associated)

## 결론

`fmm_persona` custom object 방식은 **기술적으로 구현 가능**하지만, 현재 코드에서 사용하는 `fetchCrmObjectProperties` 방식과는 완전히 다른 접근이 필요합니다. `hubspot.fetch()`를 통한 HubSpot API 직접 호출로 association과 custom object 데이터를 순차적으로 가져와야 합니다.

구현 시 에러 처리, 로딩 상태 관리, 그리고 persona가 연결되지 않은 경우에 대한 처리를 반드시 포함해야 합니다.
