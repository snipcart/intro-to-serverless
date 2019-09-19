import { APIGatewayProxyHandler} from 'aws-lambda';
import * as Sendgrid from '@sendgrid/mail';
import 'source-map-support/register';

interface FormSubmissionPayload {
  sourceName: string;
  fullName: string;
  emailAddress: string;
  message: string;
}

const corsHeader = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': false
  }
};

export const receiveSubmission: APIGatewayProxyHandler = async (event, _context) => {  

  const payload = JSON.parse(event.body) as FormSubmissionPayload;

  Sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const [response] = await Sendgrid.send({
      subject: `Message from ${payload.fullName} on ${payload.sourceName}`,
      personalizations: [{ to: { email: process.env.CONTACT_FORM_EMAIL_RECIPIENT } }],
      from: { name: payload.fullName, email: payload.emailAddress },
      content: [{ type: "text/plain", value: payload.message }]
    });    

    if (response.statusCode < 300) {
      return { statusCode: 200, body: 'email_sent', ...corsHeader};
    }
    
    console.error(response.statusCode);
    return { statusCode: 400, body: 'error', ...corsHeader};
  }
  catch (err) {
    console.error(err);
    return { statusCode: 400, body: 'error', ...corsHeader};
  }
}