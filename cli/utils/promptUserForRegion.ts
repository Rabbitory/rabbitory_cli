import { prompt } from "enquirer";

const regions: { [key: string]: string[] } = {
  "USA":
    ["us-east-1", "us-east-2", "us-west-1", "us-west-2"],
  "Canada":
    ["ca-central-1"],
  "Asia Pacific":
    ["ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2", "ap-south-1"],
  "Europe":
    ["eu-central-1", "eu-north-1", "eu-west-1", "eu-west-2", "eu-west-3"],
  "South America":
    ["sa-east-1"]
}

const getContinent = async () => {
  const response: { continent: string } = await prompt([
    {
      type: "select",
      name: "continent",
      message: "Select your continent:",
      choices: Object.keys(regions)
    }
  ]);
  return response.continent;
}

export const promptUserForRegion = async () => {
  const continent = await getContinent();

  const regionResponse: { region: string } = await prompt([
    {
      type: "select",
      name: "region",
      message: "Select your region:",
      choices: regions[continent]
    }
  ])

  return regionResponse.region;
}
