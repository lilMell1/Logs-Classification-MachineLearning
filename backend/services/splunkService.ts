// src/utils/splunkService.ts
import axios from 'axios';

const splunkUrl = 'http://127.0.0.1:8001/services/collector/event';
const token = '23e98c44-210f-4a3b-ba18-0cac3f952a95';

// Function to send data to Splunk
export const sendLogToSplunk = async (event: string) => {
  const payload = {
    event,
    sourcetype: '_json',
    index: 'main',
  };

  const headers = {
    'Authorization': `Splunk ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(splunkUrl, payload, { headers });
    return response.data;
  } catch (error:any) {
    throw new Error(`Error sending data to Splunk: ${error.message}`);
  }
};

// Function to query Splunk (this could be extended for more specific queries)
export const getLogsFromSplunk = async () => {
  const query = 'search index=main sourcetype=_json | head 10'; // Adjust as needed

  const jobResponse = await axios.post(
    'http://127.0.0.1:8009/services/search/jobs',
    new URLSearchParams({
      search: query,
      exec_mode: 'blocking',
    }),
    {
      headers: {
        'Authorization': `Splunk ${token}`,
      },
    }
  );

  const jobId = jobResponse.data.sid;
  const resultResponse = await axios.get(
    `http://127.0.0.1:8009/services/search/jobs/${jobId}/results`,
    {
      headers: {
        'Authorization': `Splunk ${token}`,
      },
    }
  );

  return resultResponse.data;
};
