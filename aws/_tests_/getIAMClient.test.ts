import { IAMClient } from "@aws-sdk/client-iam";
import { 
  getIAMClient, 
  setPrivateIAMClientForTesting,
} from "../IAM/getIAMClient";
import { getRegion } from "../../cli/utils/region";

jest.mock('../../cli/utils/region', () => ({
  getRegion: jest.fn(),
}));

jest.mock("@aws-sdk/client-iam", () => {
  return {
    IAMClient: jest.fn().mockImplementation(() => {
      return {
        config: {
          region: "us-east-1",
        },
      };
    }),
  };
});

beforeEach(() => {
  setPrivateIAMClientForTesting(null);
});

it("should return the current iamClient if one is present", () => {
  expect.assertions(1);
  const mockIAMClient = new IAMClient({ region: 'us-east-1' });

  setPrivateIAMClientForTesting(mockIAMClient);

  const client = getIAMClient();
  expect(client).toBe(mockIAMClient);
});

it("should create a new iamClient if one is not present", () => {
  expect.assertions(3);
  const mockRegion = 'us-east-1';
  setPrivateIAMClientForTesting(null);
  (getRegion as jest.Mock).mockReturnValue(mockRegion);

  const client = getIAMClient();

  expect(getRegion).toHaveBeenCalledTimes(1);
  expect(IAMClient).toHaveBeenCalledWith({ region: mockRegion });
  expect(client.config.region).toEqual(mockRegion);
});

