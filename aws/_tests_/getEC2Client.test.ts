import { EC2Client } from "@aws-sdk/client-ec2";
import { 
  getEC2Client, 
  setPrivateEC2ClientForTesting,
} from "../EC2/getEC2Client";
import { getRegion } from "../../cli/utils/region";

jest.mock('../../cli/utils/region', () => ({
  getRegion: jest.fn(),
}));

jest.mock("@aws-sdk/client-ec2", () => {
  return {
    EC2Client: jest.fn().mockImplementation(() => {
      return {
        config: {
          region: "us-east-1",
        },
      };
    }),
  };
});

beforeEach(() => {
  setPrivateEC2ClientForTesting(null);
});

it("should return the current ec2Client if one is present", () => {
  expect.assertions(1);
  const mockEC2Client = new EC2Client({ region: 'us-east-1' });

  setPrivateEC2ClientForTesting(mockEC2Client);

  const client = getEC2Client();
  expect(client).toBe(mockEC2Client);
});

it("should create a new ec2Client if one is not present", () => {
  expect.assertions(3);
  const mockRegion = 'us-east-1';
  setPrivateEC2ClientForTesting(null);
  (getRegion as jest.Mock).mockReturnValue(mockRegion);

  const client = getEC2Client();

  expect(getRegion).toHaveBeenCalledTimes(1);
  expect(EC2Client).toHaveBeenCalledWith({ region: mockRegion });
  expect(client.config.region).toEqual(mockRegion);
});

