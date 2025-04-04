import { prompt } from "enquirer";
import { setRegion } from "./region";

interface GlobalRegionsType {
  "North America": string[];
  "South America": string[];
  "Europe": string[];
  "Asia Pacific": string[];
  "Middle East": string[];
  "Africa": string[];
}

type GlobalRegionType = keyof GlobalRegionsType;

interface GlobalRegionResponseType {
  globalRegion: GlobalRegionType;
}

interface AWSRegionResponseType {
  awsRegion: string;
}

const globalRegions: GlobalRegionsType = {
  "North America": [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "ca-central-1", "mx-west-1",
  ],
  "South America": [
    "sa-east-1",
  ],
  "Europe": [
    "eu-central-1", "eu-north-1", "eu-west-1", "eu-west-2", "eu-west-3",
  ],
  "Asia Pacific": [
    "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2", "ap-south-1",
    "ap-east-1", "ap-south-2",
  ],
  "Middle East": [
    "me-south-1", "me-central-1", "is-central-1",
  ],
  "Africa": [
    "af-south-1",
  ],
};

const promptUserForGlobalRegion = async (): Promise<GlobalRegionType> => {
  const response: GlobalRegionResponseType = await prompt([
    {
      type: "select",
      name: "globalRegion",
      message: "Select your global region:",
      choices: Object.keys(globalRegions),
    }
  ]);

  return response.globalRegion;
}

export const promptUserForAWSRegion = async (): Promise<void> => {
  const globalRegion: GlobalRegionType = await promptUserForGlobalRegion();
  const response: AWSRegionResponseType = await prompt([
    {
      type: "select",
      name: "region",
      message: "Select your region:",
      choices: globalRegions[globalRegion]
    }
  ]);

  setRegion(response.awsRegion);
}