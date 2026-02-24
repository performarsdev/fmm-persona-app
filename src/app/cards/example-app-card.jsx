import React, { useState, useEffect } from "react";
import { 
  Heading, 
  Divider, 
  DescriptionList, 
  DescriptionListItem, 
  Text, 
  Flex,
  Link,
  Tag,
  LoadingSpinner,
  hubspot 
} from "@hubspot/ui-extensions";

hubspot.extend(({ context, actions }) => <Extension context={context} actions={actions} />);

const Extension = ({ context, actions }) => {
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        // Contact 속성 가져오기
        const properties = await actions.fetchCrmObjectProperties([
          "firstname",
          "lastname",
          "email",
          "phone",
          "jobtitle",
          "company",
          "city",
          "state",
          "lifecyclestage",
          "hs_persona",
          "createdate",
          "lastmodifieddate"
        ]);
        
        setContactData(properties);
      } catch (error) {
        console.error("Failed to fetch contact data:", error);
        actions.addAlert({
          type: "danger",
          message: "데이터를 불러올 수 없습니다"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, [context.crm.objectId]);

  if (loading) {
    return (
      <Flex direction="column" align="center" gap="medium">
        <LoadingSpinner />
        <Text>Loading contact data...</Text>
      </Flex>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "--";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const fullName = `${contactData?.firstname || ""} ${contactData?.lastname || ""}`.trim() || "Unknown";

  return (
    <Flex direction="column" gap="large">
      {/* Persona Highlight Section */}
      <Flex direction="column" gap="small">
        <Heading>Persona Highlight</Heading>
        <Divider />
        
        <Flex direction="row" justify="between" gap="medium">
          <Flex direction="column" gap="xs" flex={1}>
            <Text format={{ fontWeight: "bold" }}>PERSONA NAME</Text>
            <Text>{fullName}</Text>
          </Flex>
          
          <Flex direction="column" gap="xs" flex={1}>
            <Text format={{ fontWeight: "bold" }}>PERSONA CREATE DATE</Text>
            <Text>{formatDate(contactData?.createdate)}</Text>
          </Flex>
          
          <Flex direction="column" gap="xs" flex={1}>
            <Text format={{ fontWeight: "bold" }}>PERSONA UPDATE DATE</Text>
            <Text>{formatDate(contactData?.lastmodifieddate)}</Text>
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
              <Text>{fullName}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Sex</Text>
              <Text>Male</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona age</Text>
              <Text>40</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Education level</Text>
              <Text>Bachelor's degree</Text>
            </Flex>
          </Flex>
          
          <Flex direction="row" gap="large">
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona geography</Text>
              <Text>{contactData?.city || "Urban"}</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Household/ persona</Text>
              <Tag variant="success">ENGAGE WITH CHILDREN</Tag>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Household income</Text>
              <Text>150,000</Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona background</Text>
              <Text>
                {fullName} grew up in a small town in {contactData?.state || "Oregon"} and 
                moved to {contactData?.city || "Arizona"} for college. He fell in love with 
                the desert landscape and decided to settle there.
              </Text>
              <Link href="#">See more</Link>
            </Flex>
          </Flex>
          
          <Flex direction="row" gap="large">
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona goal</Text>
              <Text>
                {fullName} aims to master new technologies to improve his web development 
                skills and create better user experiences. He values adaptability, innovation, 
                and the power of technology to make life easier.
              </Text>
              <Link href="#">See more</Link>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona pain-point</Text>
              <Text>
                {fullName}'s main challenge is staying updated with the rapidly evolving 
                web technologies. He often experiences frustration when dealing with 
                unexpected errors and compatibility issues across different platforms.
              </Text>
              <Link href="#">See more</Link>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona Storytelling</Text>
              <Text>
                {fullName}, a 40-year-old web developer residing in {contactData?.city || "Arizona"}, 
                lives a life surrounded by codes and algorithms. His passion for technology 
                drives him to constantly explore new tools and frameworks.
              </Text>
              <Link href="#">See more</Link>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona Generic keywords</Text>
              <Text>fullpage js</Text>
            </Flex>
          </Flex>
          
          <Flex direction="column" gap="xs">
            <Text format={{ fontWeight: "bold" }}>Persona brand keywords</Text>
            <Text>--</Text>
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
                To understand the potential benefits of new web technologies like 
                fullpage.js for his projects.
              </Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona consideration goal</Text>
              <Text>
                Evaluate the suitability and integration of new technologies into 
                existing projects.
              </Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona decision goal</Text>
              <Text>
                Decide to integrate or not to integrate the technology into his work.
              </Text>
            </Flex>
            
            <Flex direction="column" gap="xs" flex={1}>
              <Text format={{ fontWeight: "bold" }}>Persona onboard goal</Text>
              <Text>
                Seamlessly implement the new technology with minimal disruptions.
              </Text>
            </Flex>
          </Flex>
          
          <Flex direction="column" gap="xs">
            <Text format={{ fontWeight: "bold" }}>Persona advocate goal</Text>
            <Text>
              To become a vocal advocate for effective tools within his online community.
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
