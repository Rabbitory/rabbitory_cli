import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  getDDBClient, 
  setPrivateDDBClientForTesting,
} from "../dynamoDB/getDDBClient";
import { getRegion } from "../../cli/utils/region";

jest.mock('../../cli/utils/region', () => ({
  getRegion: jest.fn(),
}));

jest.mock("@aws-sdk/client-dynamodb", () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation(() => {
      return {
        config: {
          region: "us-east-1",
        },
      };
    }),
  };
});

beforeEach(() => {
  setPrivateDDBClientForTesting(null);
});

it("should return the current ddbClient if one is present", () => {
  expect.assertions(1);
  const mockDDBClient = new DynamoDBClient({ region: 'us-east-1' });

  setPrivateDDBClientForTesting(mockDDBClient);

  const client = getDDBClient();
  expect(client).toBe(mockDDBClient);
});

it("should create a new ddbClient if one is not present", () => {
  expect.assertions(3);
  const mockRegion = 'us-east-1';
  setPrivateDDBClientForTesting(null);
  (getRegion as jest.Mock).mockReturnValue(mockRegion);

  const client = getDDBClient();

  expect(getRegion).toHaveBeenCalledTimes(1);
  expect(DynamoDBClient).toHaveBeenCalledWith({ region: mockRegion });
  expect(client.config.region).toEqual(mockRegion);
});

