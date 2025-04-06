import { prompt } from 'enquirer';
import { promptUserForRegionCode } from '../utils/promptUserForAWSRegion';
import { setRegion } from '../utils/region';

jest.mock('enquirer', () => ({
  prompt: jest.fn(),
}));

jest.mock('../utils/region');

const mockedPrompt = prompt as jest.Mock;
const mockedSetRegion = setRegion as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

it('should prompt user for global region and AWS region, then calls setRegion', async () => {
  mockedPrompt
    .mockResolvedValueOnce({ globalRegion: 'Europe' })
    .mockResolvedValueOnce({ awsRegion: 'eu-west-2' });

  await promptUserForRegionCode();

  expect(mockedPrompt).toHaveBeenCalledTimes(2);
  expect(mockedSetRegion).toHaveBeenCalledWith('eu-west-2');
});
