import React, { useState, useEffect } from "react";
import { 
  Heading, 
  Divider, 
  Text, 
  Flex,
  Tag,
  LoadingSpinner,
  Button,
  hubspot 
} from "@hubspot/ui-extensions";

hubspot.extend(({ context, actions }) => <Extension context={context} actions={actions} />);

const Extension = ({ context, actions }) => {
  const [personaData, setPersonaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 각 필드의 펼침/접힘 상태 관리
  const [expandedFields, setExpandedFields] = useState({
    background: false,
    goal: false,
    painpoint: false,
    storytelling: false,
    awareness: false,
    consideration: false,
    decision: false,
    onboard: false,
    advocate: false
  });

  // 텍스트 축약 함수
  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // 펼침/접힘 토글 함수
  const toggleExpand = (fieldName) => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  useEffect(() => {
    const fetchPersonaData = async () => {
      try {
        setLoading(true);
        
        // TODO: 외부 시스템에서 토큰을 주입받도록 변경 예정
        const PRIVATE_APP_TOKEN = 'YOUR_PRIVATE_APP_TOKEN_HERE';
        
        // 1. Schemas API를 통해 fmm_personars Custom Object Type ID 조회
        console.log("Fetching custom object schemas...");
        const schemasUrl = 'https://api.hubapi.com/crm/v3/schemas';
        const schemasResponse = await hubspot.fetch(schemasUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${PRIVATE_APP_TOKEN}`
          }
        });
        
        if (!schemasResponse.ok) {
          const errorText = await schemasResponse.text();
          console.error("Schemas API error:", errorText);
          throw new Error(`Failed to fetch schemas: ${schemasResponse.status}`);
        }
        
        const schemasData = await schemasResponse.json();
        console.log("Schemas data:", schemasData);
        
        // fmm_personars 스키마 찾기
        const personaSchema = schemasData.results.find(
          schema => schema.name === 'fmm_persona'
        );
        
        if (!personaSchema) {
          throw new Error("Custom object 'fmm_personas' not found in account");
        }
        
        const CUSTOM_OBJECT_TYPE_ID = personaSchema.objectTypeId;
        console.log("Found Custom Object Type ID:", CUSTOM_OBJECT_TYPE_ID);
        console.log("Fetching persona for contact:", context.crm.objectId);
        
        // 2. Contact에 연결된 fmm_personars association 조회
        const associationUrl = `https://api.hubapi.com/crm/v4/objects/contacts/${context.crm.objectId}/associations/${CUSTOM_OBJECT_TYPE_ID}`;
        console.log("Fetching associations from:", associationUrl);
        
        const associationResponse = await hubspot.fetch(associationUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${PRIVATE_APP_TOKEN}`
          }
        });
        
        console.log("Association response status:", associationResponse.status);
        
        if (!associationResponse.ok) {
          const errorText = await associationResponse.text();
          console.error("Association API error details:", errorText);
          throw new Error(`Association API error: ${associationResponse.status} - ${errorText}`);
        }
        
        const associations = await associationResponse.json();
        console.log("Association response data:", associations);
        
        if (associations.results && associations.results.length > 0) {
          // N:1 관계이므로 첫 번째 persona ID 가져오기
          const personaId = associations.results[0].toObjectId;
          console.log("Found persona ID:", personaId);
          
          // 3. fmm_personars 프로퍼티 조회
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
            "hs_createdate",
            "hs_lastmodifieddate"
          ].join(",");
          
          // Custom Object API는 이름 또는 type ID 모두 사용 가능
          const personaUrl = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE_ID}/${personaId}?properties=${properties}`;
          console.log("Fetching persona from:", personaUrl);
          
          const personaResponse = await hubspot.fetch(personaUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${PRIVATE_APP_TOKEN}`
            }
          });
          
          console.log("Persona response status:", personaResponse.status);
          
          if (!personaResponse.ok) {
            const errorText = await personaResponse.text();
            console.error("Persona API error details:", errorText);
            throw new Error(`Persona API error: ${personaResponse.status} - ${errorText}`);
          }
          
          const personaResult = await personaResponse.json();
          console.log("Persona data:", personaResult);
          setPersonaData(personaResult.properties);
        } else {
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
            <Text>{formatDate(personaData.hs_createdate)}</Text>
          </Flex>
          
          <Flex direction="column" gap="xs" flex={1}>
            <Text format={{ fontWeight: "bold" }}>PERSONA UPDATE DATE</Text>
            <Text>{formatDate(personaData.hs_lastmodifieddate)}</Text>
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
              <Text>
                {expandedFields.background 
                  ? personaData.persona_background 
                  : truncateText(personaData.persona_background, 100)
                }
              </Text>
              {personaData.persona_background && personaData.persona_background.length > 100 && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => toggleExpand('background')}
                >
                  {expandedFields.background ? 'Show less' : 'See more'}
                </Button>
              )}
            </Flex>
          </Flex>
          
          <Flex direction="row" gap="large">
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona goal</Text>
              <Text>
                {expandedFields.goal 
                  ? personaData.persona_goal 
                  : truncateText(personaData.persona_goal, 100)
                }
              </Text>
              {personaData.persona_goal && personaData.persona_goal.length > 100 && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => toggleExpand('goal')}
                >
                  {expandedFields.goal ? 'Show less' : 'See more'}
                </Button>
              )}
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona pain-point</Text>
              <Text>
                {expandedFields.painpoint 
                  ? personaData.persona_painpoint 
                  : truncateText(personaData.persona_painpoint, 100)
                }
              </Text>
              {personaData.persona_painpoint && personaData.persona_painpoint.length > 100 && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => toggleExpand('painpoint')}
                >
                  {expandedFields.painpoint ? 'Show less' : 'See more'}
                </Button>
              )}
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona Storytelling</Text>
              <Text>
                {expandedFields.storytelling 
                  ? personaData.persona_storytelling 
                  : truncateText(personaData.persona_storytelling, 100)
                }
              </Text>
              {personaData.persona_storytelling && personaData.persona_storytelling.length > 100 && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => toggleExpand('storytelling')}
                >
                  {expandedFields.storytelling ? 'Show less' : 'See more'}
                </Button>
              )}
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
              <Text>
                {expandedFields.awareness 
                  ? personaData.awareness_goal 
                  : truncateText(personaData.awareness_goal, 100)
                }
              </Text>
              {personaData.awareness_goal && personaData.awareness_goal.length > 100 && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => toggleExpand('awareness')}
                >
                  {expandedFields.awareness ? 'Show less' : 'See more'}
                </Button>
              )}
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona consideration goal</Text>
              <Text>
                {expandedFields.consideration 
                  ? personaData.consideration_goal 
                  : truncateText(personaData.consideration_goal, 100)
                }
              </Text>
              {personaData.consideration_goal && personaData.consideration_goal.length > 100 && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => toggleExpand('consideration')}
                >
                  {expandedFields.consideration ? 'Show less' : 'See more'}
                </Button>
              )}
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona decision goal</Text>
              <Text>
                {expandedFields.decision 
                  ? personaData.decision_goal 
                  : truncateText(personaData.decision_goal, 100)
                }
              </Text>
              {personaData.decision_goal && personaData.decision_goal.length > 100 && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => toggleExpand('decision')}
                >
                  {expandedFields.decision ? 'Show less' : 'See more'}
                </Button>
              )}
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona onboard goal</Text>
              <Text>
                {expandedFields.onboard 
                  ? personaData.onboard_goal 
                  : truncateText(personaData.onboard_goal, 100)
                }
              </Text>
              {personaData.onboard_goal && personaData.onboard_goal.length > 100 && (
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => toggleExpand('onboard')}
                >
                  {expandedFields.onboard ? 'Show less' : 'See more'}
                </Button>
              )}
            </Flex>
          </Flex>
          
          <Flex direction="column" gap="xs">
            <Text format={{ fontWeight: "bold" }}>Persona advocate goal</Text>
            <Text>
              {expandedFields.advocate 
                ? personaData.advocate_goal 
                : truncateText(personaData.advocate_goal, 100)
              }
            </Text>
            {personaData.advocate_goal && personaData.advocate_goal.length > 100 && (
              <Button
                size="xs"
                variant="secondary"
                onClick={() => toggleExpand('advocate')}
              >
                {expandedFields.advocate ? 'Show less' : 'See more'}
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
